// import defer from 'promise-defer';
import firebase from 'firebase';
import { Node } from 'prosemirror-model';
import { Step, Mapping } from 'prosemirror-transform';
import { Plugin, Selection, EditorState, AllSelection } from 'prosemirror-state';
import { sendableSteps, receiveTransaction } from 'prosemirror-collab';
import { compressStepsLossy, compressStateJSON, uncompressStateJSON, compressSelectionJSON, uncompressSelectionJSON, compressStepJSON, uncompressStepJSON } from 'prosemirror-compress';
import { DecorationSet, Decoration } from 'prosemirror-view';

const TIMESTAMP = { '.sv': 'timestamp' };
const SAVE_EVERY_N_STEPS = 100;

const stringToColor = (string, alpha = 1)=> {
	const hue = string.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0) % 360;
	return `hsla(${hue}, 100%, 50%, ${alpha})`;
};

class DocumentRef {
	constructor(firebaseRef, view, localClientId) {
		this.ref = firebaseRef;
		this.view = view;
		this.latestKey = null;
		this.onClientChange = undefined;
		this.localClientId = localClientId;
		this.selections = {};
	}

	compressedStepJSONToStep = (compressedStepJSON) => {
		return Step.fromJSON(this.view.state.schema, uncompressStepJSON(compressedStepJSON));
	}

	getCheckpoint = (isFirstLoad) => {
		const checkpointRef = this.ref.child('checkpoint');
		return checkpointRef.once('value').then((snapshot) => {
			const { d, k } = snapshot.val() || {};
			let checkpointKey = k || 0;
			checkpointKey = Number(checkpointKey);
			const newDoc = d && Node.fromJSON(this.view.state.schema, uncompressStateJSON({ d }).doc);
			if (isFirstLoad) {
				this.latestKey = checkpointKey;
			}
			return { newDoc, checkpointKey };
		});
	}

	getChanges = (changesKey) => {
		const changesRef = this.ref.child('changes');

		return changesRef
		.startAt(null, String(changesKey))
		.once('value').then((snapshot) => {
			const changes = snapshot.val();
			if (changes) {
				const steps = [];
				const stepClientIDs = [];
				const placeholderClientId = `_oldClient${Math.random()}`;
				const keys = Object.keys(changes);
				const stepsWithKeys = [];
				this.latestKey = Math.max(...keys);

				for (const key of keys) {
					const compressedStepsJSON = changes[key].s;
					const uncompressedSteps = compressedStepsJSON.map(this.compressedStepJSONToStep);
					stepsWithKeys.push({ key, steps: uncompressedSteps });
					steps.push(...compressedStepsJSON.map(this.compressedStepJSONToStep));
					stepClientIDs.push(...new Array(compressedStepsJSON.length).fill(placeholderClientId));
				}
				return { steps, stepClientIDs, stepsWithKeys };
			}
			return {steps: null, stepClientIDs: null, stepsWithKeys: null};
		});
	}

	sendChanges = ({ steps, clientID, meta, newState }) => {
		const changesRef = this.ref.child('changes');
		this.latestKey = this.latestKey + 1;

		return changesRef.child(this.latestKey).transaction(
			(existingBatchedSteps)=> {
				if (!existingBatchedSteps) {
					// selfChanges[latestKey + 1] = steps
					return {
						s: compressStepsLossy(steps)
						.map((step) => {
							return compressStepJSON(step.toJSON());
						}),
						c: clientID,
						m: meta,
						t: TIMESTAMP,
					};
				}
			},
			(error, committed, { key })=> {
				if (error) {
					console.error('updateCollab', error, steps, clientID, key);
				} else if (committed && key % SAVE_EVERY_N_STEPS === 0 && key > 0) {
					this.updateCheckpoint(newState, key);
				}
			},
			false);
	}

	updateCheckpoint = (newState, key) => {
		const checkpointRef = this.ref.child('checkpoint');
		const { d } = compressStateJSON(newState.toJSON());
		checkpointRef.set({ d, k: key, t: TIMESTAMP });
	}

	listenToChanges = (onRemoteChange) => {
		const changesRef = this.ref.child('changes');

		changesRef.startAt(null, String(this.latestKey + 1))
		.on('child_added', (snapshot) => {
			this.latestKey = Number(snapshot.key);
			const { s: compressedStepsJSON, c: clientID, m: meta } = snapshot.val();
			const isLocal = (clientID === this.localClientId);
			if (isLocal) {
				onRemoteChange({ isLocal, meta, changeKey: this.latestKey });
			} else {
				const steps = compressedStepsJSON.map(this.compressedStepJSONToStep);
				const stepClientIDs = new Array(steps.length).fill(clientID);
				onRemoteChange({ steps, stepClientIDs, meta, changeKey: this.latestKey });
			}
		});
	}

	listenToSelections = (onClientChange) => {
		const selectionsRef = this.ref.child('selections');

		const selfSelectionRef = selectionsRef.child(this.localClientId);
		selfSelectionRef.onDisconnect().remove();

		this.onClientChange = onClientChange;
		selectionsRef.on('child_added', this.addClientSelection);
		selectionsRef.on('child_changed', this.updateClientSelection);
		selectionsRef.on('child_removed', this.deleteClientSelection);
	}

	issueEmptyTransaction = () => {
		this.view.dispatch(this.view.state.tr);
	}


	updateClientSelection = (snapshot) => {
		const clientID = snapshot.key;
		if (clientID !== this.localClientId) {
			const compressedSelection = snapshot.val();
			if (compressedSelection) {
				try {
					this.selections[clientID] = {
						...Selection.fromJSON(this.view.state.doc, uncompressSelectionJSON(compressedSelection)),
						cat: Math.random()
					};
				} catch (error) {
					console.warn('updateClientSelection', error);
				}
			} else {
				delete this.selections[clientID];
			}
			this.issueEmptyTransaction();
		}
	}


	deleteClientSelection = (snapshot) => {
		const clientID = snapshot.key;
		delete this.selections[clientID];
		if (this.onClientChange) {
			this.onClientChange(this.selections);
		}
		this.issueEmptyTransaction();
	}

	addClientSelection = (snapshot) => {
		this.updateClientSelection(snapshot);
		if (this.onClientChange) {
			this.onClientChange(this.selections);
		}
	}

	setSelection = (selection) => {
		const selectionsRef = this.ref.child('selections');
		const selfSelectionRef = selectionsRef.child(this.localClientId);
		return selfSelectionRef.set(compressSelectionJSON(selection.toJSON()));
	}

	mapSelection = (transaction, editorState) => {
		for (const clientID in this.selections) {
			this.selections[clientID] = this.selections[clientID].map(editorState.doc, transaction.mapping);
		}
	}

	// healDatabase - In case a step corrupts the document (happens surpsiginly often), 
	// apply each step individually to find errors
	// and then delete all of those steps
	healDatabase = ({ stepsWithKeys, view }) => {
		const stepsToDelete = [];
		const placeholderClientId = `_oldClient${Math.random()}`;
		const changesRef = this.ref.child('changes');

		console.log('Healing database');
		for (const step of stepsWithKeys) {
			try {
				const trans = receiveTransaction(view.state, step.steps, [placeholderClientId]);
				trans.setMeta('receiveDoc', true);
				view.dispatch(trans);
			} catch (err) {
				stepsToDelete.push(step.key);
			}
		}

		for (const stepToDelete of stepsToDelete) {
			changesRef.child(stepToDelete).remove();
		}
	}
}


let firebaseApp;

class FirebasePlugin extends Plugin {
	constructor({ localClientId, editorKey, firebaseConfig, rootRef, editorRef, pluginKey, onClientChange }) {
		super({ key: pluginKey });
		this.spec = {
			view: this.updateView,
			state: {
				init: this.init,
				apply: this.apply
			},
		};

		this.props = {
			decorations: this.decorations
		};

		this.onClientChange = onClientChange;
		this.localClientId = localClientId;
		this.editorKey = editorKey;
		this.selfChanges = {};

		if (!firebaseApp) {
			firebaseApp = firebase.initializeApp(firebaseConfig);
		}

		if (firebaseConfig) {
			// firebaseDb = firebase.database();
			this.rootRef = firebase.database(firebaseApp);
			this.firebaseRef = this.rootRef.ref(editorKey);
		} else if (rootRef) {
			this.rootRef = rootRef;
			if (editorKey) {
				this.firebaseRef = this.rootRef.ref(editorKey);
			} else if (editorRef) {
				this.firebaseRef = editorRef;
			} else {
				console.error('Did not include a reference to the editor firebase instance or an editor key.');
				return null;
			}
		} else {
			console.error('Did not include a firebase config or root ref.x');
			return null;
		}
	}


	init = (config, instance) => {
		return { };
	}

	loadDocument = () => {
		if (this.startedLoad) {
			return null;
		}
		this.startedLoad = true;
		this.document = new DocumentRef(this.firebaseRef, this.view, this.localClientId);
		this.document.getCheckpoint(true)
		.then(({ newDoc, checkpointKey }) => {
			if (newDoc) {
				const newState = EditorState.create({
					doc: newDoc,
					plugins: this.view.state.plugins,
				});
				this.view.updateState(newState);
			}

			return this.document.getChanges(checkpointKey);
		})
		.then(({ steps, stepClientIDs, stepsWithKeys }) => {
			if (steps) {
				try {
					const trans = receiveTransaction(this.view.state, steps, stepClientIDs);
					trans.setMeta('receiveDoc', true);
					this.view.dispatch(trans);
				} catch (err) {
					this.document.healDatabase({ stepsWithKeys, view: this.view });
				}
			}
			this.document.listenToSelections(this.onClientChange);
			this.document.listenToChanges(this.onRemoteChange);
		});
	}

	sendCollabChanges = (transaction, newState) => {
		const { meta } = transaction;

		// if (newState !== this.view.state) {
		// 	console.log('FREAK OUT AABOUT STATE');
		// 	debugger;
		// }

		if (meta.collab$ || meta.rebase) {
			return;
		}
		if (meta.pointer) {
			delete meta.pointer;
		}
		if (meta.rebase) {
			delete meta.rebase;
		}
		if (meta.addToHistory) {
			delete meta.addToHistory;
		}

		/*
		const trackPlugin = getPlugin('track', editorView.state);
		const updateRebasedSteps = () => {
			const sendableTracks = trackPlugin.getSendableSteps();
			if (sendableTracks) {
				this.props.storeRebaseSteps(sendableTracks);
			}
		}

		// undo timeout?
		if (trackPlugin) {
			window.setTimeout(updateRebasedSteps, 0);
		}
		*/

		const sendable = sendableSteps(newState);

		// Do not perform if sendable.version is duplicated.
		if (sendable && sendable.version !== this.sendableVersion) {
			this.sendableVersion = sendable.version;
			const { steps, clientID } = sendable;
			this.document.sendChanges({ steps, clientID, meta, newState });
			const recievedClientIDs = new Array(steps.length).fill(this.localClientId);
			this.selfChanges[this.document.latestKey] = steps;
		}
	}

	onRemoteChange = ({ steps, stepClientIDs, changeKey, meta, isLocal }) => {
		let receivedSteps;
		let recievedClientIDs;

		if (isLocal) {
			receivedSteps = this.selfChanges[changeKey];
			recievedClientIDs = new Array(receivedSteps.length).fill(this.localClientId);
			// console.log('got local ', changeKey, receivedSteps, recievedClientIDs);
		} else {
			receivedSteps = steps;
			recievedClientIDs = stepClientIDs;
		}
		const trans = receiveTransaction(this.view.state, receivedSteps, recievedClientIDs);
		if (meta) {
			for (let metaKey in meta) {
				trans.setMeta(metaKey, meta[metaKey]);
			}
		}
		trans.setMeta('receiveDoc', true);
		this.view.dispatch(trans);
		delete this.selfChanges[changeKey];
	}

	apply = (transaction, state, prevEditorState, editorState) => {
		if (transaction.docChanged) {
			this.document.mapSelection(transaction, editorState);
		}

		// console.log(transaction, transaction.meta, transaction.selectionSet);
		// Right now - arrow keys won't update the selection. We should check 
		// if arrow key and change if so.
		if (transaction.getMeta('pointer')) {
			const selection = editorState.selection;
			if (selection instanceof AllSelection === false) {
				this.document.setSelection(selection);
			}
		}

		return {};
	}

	updateView = (view) => {
		this.view = view;
		this.loadDocument();
		return {
			update: (newView, prevState) => {
				this.view = newView;
			},
			destroy: () => {
				this.view = null;
			}
		};
	}

	decorations = (state) => {
		// return null;
		if (!this.document) { return null; }
		return DecorationSet.create(state.doc, Object.keys(this.document.selections).map((clientID)=> {
			const selection = this.document.selections[clientID];
			if (!selection) {
				return null;
			}
			const { from, to } = selection;

			if (clientID === this.localClientId) {
				return null;
			}
			if (from === to) {
				const elem = document.createElement('span');
				elem.className = `collab-cursor ${this.localClientId}`;
				// elem.style.borderLeft = `1px solid ${stringToColor(clientID)}`;
				elem.style['pointer-events'] = 'none';
				return Decoration.widget(from, elem);
			}
			return Decoration.inline(from, to, {
				class: `collab-selection ${this.localClientId}`,
				// style: `background-color: ${stringToColor(clientID, 0.2)};`,
			});
		}).filter((dec) => {
			return !!dec;
		}));
	}
}

export default FirebasePlugin;
