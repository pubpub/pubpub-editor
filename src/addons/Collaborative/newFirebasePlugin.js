import { AllSelection, EditorState, Plugin } from 'prosemirror-state';
import { Decoration, DecorationSet } from 'prosemirror-view';
import { receiveTransaction, sendableSteps } from 'prosemirror-collab';

import DocumentRef from './documentRef';
// import defer from 'promise-defer';
import firebase from 'firebase';

const stringToColor = (string, alpha = 1)=> {
	const hue = string.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0) % 360;
	return `hsla(${hue}, 100%, 50%, ${alpha})`;
};


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
