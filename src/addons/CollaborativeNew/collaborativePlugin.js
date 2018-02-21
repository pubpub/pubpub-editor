import { AllSelection, EditorState, Plugin, Selection } from 'prosemirror-state';
import { Decoration, DecorationSet } from 'prosemirror-view';
import { receiveTransaction, sendableSteps } from 'prosemirror-collab';
import { Step } from 'prosemirror-transform';
import { Node } from 'prosemirror-model';
import { compressSelectionJSON, compressStateJSON, compressStepJSON, compressStepsLossy, uncompressSelectionJSON, uncompressStateJSON, uncompressStepJSON } from 'prosemirror-compress';
import firebase from 'firebase';
// import CursorType from './CursorType';
// import DocumentRef from './documentRef';

const TIMESTAMP = { '.sv': 'timestamp' };
const SAVE_EVERY_N_STEPS = 100;

class CollaborativePlugin extends Plugin {
	constructor({ pluginKey, firebaseConfig, localClientData, localClientId, editorKey, onClientChange, onStatusChange }) {
		super({ key: pluginKey });
		/* Bind plugin functions */
		// this.init = this.init.bind(this);
		this.loadDocument = this.loadDocument.bind(this);
		this.sendCollabChanges = this.sendCollabChanges.bind(this);
		this.onRemoteChange = this.onRemoteChange.bind(this);
		this.apply = this.apply.bind(this);
		this.updateView = this.updateView.bind(this);
		this.disconnect = this.disconnect.bind(this);
		this.decorations = this.decorations.bind(this);
		this.compressedStepJSONToStep = this.compressedStepJSONToStep.bind(this);
		this.addClientSelection = this.addClientSelection.bind(this);
		this.updateClientSelection = this.updateClientSelection.bind(this);
		this.deleteClientSelection = this.deleteClientSelection.bind(this);
		this.issueEmptyTransaction = this.issueEmptyTransaction.bind(this);
		this.view = null;

		/* Setup Prosemirror plugin values */
		this.spec = {
			view: this.updateView,
			state: {
				init: ()=>{},
				apply: this.apply
			},
		};
		this.props = {
			decorations: this.decorations
		};

		/* Make passed props accessible */

		this.localClientData = localClientData;
		this.localClientId = localClientId;
		this.editorKey = editorKey;
		this.onClientChange = onClientChange;
		this.onStatusChange = onStatusChange;
		// this.onForksUpdate = onForksUpdate;


		/* Init plugin variables object */
		this.selfChanges = {};
		this.startedLoad = false;

		/* Vars from DocumentRef */
		this.latestKey = null;
		this.selections = {};

		// this.startStepIndex = startStepIndex;
		// if (!existingApp) {
		// 	this.firebaseApp = firebase.initializeApp(firebaseConfig, editorKey);
		// } else {
		// 	this.firebaseApp = existingApp;
		// }

		/* Check for firebaseConfig */
		if (!firebaseConfig) {
			console.error('Did not include a firebase config');
			return null;
		}

		/* Connect to firebase app */
		const existingApp = firebase.apps.reduce((prev, curr)=> {
			if (curr.name === editorKey) { return curr; }
			return prev;
		}, undefined);
		this.firebaseApp = existingApp || firebase.initializeApp(firebaseConfig, editorKey);
		this.rootRef = firebase.database(this.firebaseApp);
		this.rootRef.goOnline();
		this.firebaseRef = this.rootRef.ref(editorKey);
		// } else if (rootRef) {
		// 	this.rootRef = rootRef;
		// 	if (editorKey) {
		// 		this.firebaseRef = this.rootRef.ref(editorKey);
		// 	} else if (editorRef) {
		// 		this.firebaseRef = editorRef;
		// 	} else {
		// 		console.error('Did not include a reference to the editor firebase instance or an editor key.');
		// 		return null;
		// 	}
		// } else {
		// 	// console.error('Did not include a firebase config or root ref.x');
		// 	console.error('Did not include a firebase config');
		// 	return null;
		// }

		/* Set user status and watch for changes */
		const connectedRef = this.rootRef.ref('.info/connected');
		connectedRef.on('value', (snapshot)=> {
			if (snapshot.val() === true) {
				this.onStatusChange('connected');
			} else {
				this.onStatusChange('disconnected');
			}
		});
	}


	// init(config, instance) {
	// 	return { };
	// }
	compressedStepJSONToStep(compressedStepJSON) {
		return Step.fromJSON(this.view.state.schema, uncompressStepJSON(compressedStepJSON));
	}

	loadDocument() {
		if (this.startedLoad) {
			return null;
		}
		// let tempNewDoc;
		this.startedLoad = true;
		// this.document = new DocumentRef(this.firebaseRef, this.view, this.localClientId, this.localClientData);
		// this.document.getCheckpoint(true)
		return this.firebaseRef.child('checkpoint').once('value')
		.then((snapshot) => {
			const snapshotVal = snapshot.val || {};
			const snapshotDoc = snapshotVal.d;
			const snapshotKey = snapshotVal.k;
			// const { d, k } = snapshot.val() || {};
			const checkpointKey = Number(snapshotKey) || 0;
			// checkpointKey = Number(checkpointKey);
			const newDoc = snapshotDoc && Node.fromJSON(this.view.state.schema, uncompressStateJSON({ snapshotDoc }).doc);
			// if (isFirstLoad) {
			this.latestKey = checkpointKey;
			// }
			return { newDoc, checkpointKey };
		})
		.then(({ newDoc, checkpointKey }) => {
			// tempNewDoc = newDoc;
			// if (newDoc) {
			// 	const newState = EditorState.create({
			// 	tempState = EditorState.create({
			// 		doc: newDoc,
			// 		plugins: this.view.state.plugins,
			// 	});
			// 	this.view.updateState(newState);
			// }
			// return this.document.getChanges(checkpointKey);


			// const changesRef = this.firebaseRef.child('changes');

			// return changesRef
			return this.firebaseRef.child('changes')
			.startAt(null, String(checkpointKey))
			.once('value')
			.then((snapshot)=> {
				const snapshotVal = snapshot.val();
				if (!snapshotVal) {
					return { newDoc: newDoc, steps: null, stepClientIds: null, stepsWithKeys: null };
				}
				// if (snapshotVal) {
				const steps = [];
				const stepClientIds = [];
				// const placeholderClientId = `_oldClient${Math.random()}`;
				const keys = Object.keys(snapshotVal);
				const stepsWithKeys = [];
				this.latestKey = Math.max(...keys);
				keys.forEach((key)=> {
					const compressedStepsJSON = snapshotVal[key].s;
					const uncompressedSteps = compressedStepsJSON.map(this.compressedStepJSONToStep);
					stepsWithKeys.push({ key, steps: uncompressedSteps });
					steps.push(...compressedStepsJSON.map(this.compressedStepJSONToStep));
					stepClientIds.push(...new Array(compressedStepsJSON.length).fill('_server'));
				});
				// for (const key of keys) {
				// 	const compressedStepsJSON = snapshotVal[key].s;
				// 	const uncompressedSteps = compressedStepsJSON.map(this.compressedStepJSONToStep);
				// 	stepsWithKeys.push({ key, steps: uncompressedSteps });
				// 	steps.push(...compressedStepsJSON.map(this.compressedStepJSONToStep));
				// 	stepClientIDs.push(...new Array(compressedStepsJSON.length).fill(placeholderClientId));
				// }
				return { newDoc, steps, stepClientIds, stepsWithKeys };
				// }
				// return { steps: null, stepClientIDs: null, stepsWithKeys: null };
			});
		})
		.then(({ newDoc, steps, stepClientIds, stepsWithKeys }) => {
			if (newDoc) {
				this.view.updateState(EditorState.create({
					doc: newDoc,
					plugins: this.view.state.plugins,
				}));
			}
			if (steps) {
				try {
					const trans = receiveTransaction(this.view.state, steps, stepClientIds);
					trans.setMeta('receiveDoc', true);
					this.view.dispatch(trans);
				} catch (err) {
					/* TODO - we really need to find a way to make it so no corrupted step is kept on server */
					console.error('Healing database', stepsWithKeys);
					const stepsToDelete = [];
					stepsWithKeys.forEach((step)=> {
						try {
							const trans = receiveTransaction(this.view.state, step.steps, ['_server']);
							trans.setMeta('receiveDoc', true);
							this.view.dispatch(trans);
						} catch (stepError) {
							console.log('StepError is ', stepError);
							stepsToDelete.push(step.key);
						}
					});

					stepsToDelete.forEach((stepToDelete)=> {
						/* Perhaps we can just skip the step rather   */
						/* than deleting it. That way we can debug it */
						/* if a document seems to have funky errors   */
						console.log('Skipping Step ', stepToDelete);
						// this.firebaseRef.child('changes').child(stepToDelete).remove();
					});
				}
			}

			/* Listen to Selections Change */
			const selectionsRef = this.firebaseRef.child('selections');
			const selfSelectionRef = selectionsRef.child(this.localClientId);
			selfSelectionRef.onDisconnect().remove();
			selectionsRef.on('child_added', this.addClientSelection);
			selectionsRef.on('child_changed', this.updateClientSelection);
			selectionsRef.on('child_removed', this.deleteClientSelection);

			/* Listen to Changes */
			this.firebaseRef.child('changes')
			.startAt(null, String(this.latestKey + 1))
			.on('child_added', (snapshot) => {
				this.latestKey = Number(snapshot.key);
				const snapshotVal = snapshot.val();
				const compressedStepsJSON = snapshotVal.s;
				const clientId = snapshotVal.c;
				const meta = snapshotVal.m;

				if (clientId === this.localClientId) {
					/* If the change was made locally */
					this.onRemoteChange({
						isLocal: true,
						meta: meta,
						changeKey: this.latestKey
					});
				} else {
					/* If the change was made by another client */
					const changeSteps = compressedStepsJSON.map(this.compressedStepJSONToStep);
					const changeStepClientIds = new Array(steps.length).fill(clientId);
					this.onRemoteChange({
						steps: changeSteps,
						stepClientIds: changeStepClientIds,
						meta: meta,
						changeKey: this.latestKey
					});
				}
			});

			// this.document.listenToSelections(this.onClientChange);
			// this.document.listenToChanges(this.onRemoteChange);

			// if (this.onForksUpdate) {
			// 	this.getForks().then((forks) => {
			// 		this.onForksUpdate(forks);
			// 	});
			// }
		});
	}

	sendCollabChanges(transaction, newState) {
		const meta = transaction.meta;
		if (meta.collab$ || meta.rebase || meta.footnote || meta.newSelection || meta.clearTempSelection) {
			return null;
		}
		// if (meta.pointer) {
		// 	delete meta.pointer;
		// }
		// if (meta.addToHistory) {
		// 	delete meta.addToHistory;
		// }
		/* Don't send certain keys with to firebase */
		Object.keys(meta).forEach((key)=> {
			if (key.indexOf('$') > -1
				|| key === 'addToHistory'
				|| key === 'pointer'
			) {
				delete meta[key];
			}
		});

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
		// This seems like a bug. Sendable.version might be wrong becasue of race condition?
		// ***************
		// TODO! Pick up here!
		// It seems that the bug may be because of onreceive race conditions. 
		// Try setting up a rig where you have big delays, and can test all sorts of race conditions, and how they're handled
		// There are a few places where we say, 'well it doesnt crash, so just move on'.
		// Those smell bad and are probably the cause.
		// Likewise, selection flickering should be properly handled by sending along the localClient versionId,
		// and not updating unless they are up to date. Add cursors rather than circles to test.
		// - An error was created on the last step of a user. When they came back 10 minutes later, there was a bad step.
		// - If a single tab creates an error, there is no way to realize if the server has the same or differing structure. The user who creates the error is not notified of the error.
		// - HealDatabase is only ever called on initialization. Never when the error happens live.
		if (!sendable || sendable.version === this.sendableVersion) { return null; }

		this.sendableVersion = sendable.version;
		const steps = sendable.steps;
		const clientId = sendable.clientID;
		// const { steps, clientID } = sendable;
		// const onStatusChange = this.onStatusChange;
		// this.document.sendChanges({ steps, clientId, meta, newState, onStatusChange });

		// const changesRef = this.ref.child('changes');
		this.latestKey = this.latestKey + 1; /* TODO - why do we increment here, as opposed to listening on firebase? */
		// console.log('latestKey', this.latestKey);
		this.selfChanges[this.latestKey] = steps;
		return this.firebaseRef.child('changes').child(this.latestKey)
		.transaction((existingBatchedSteps)=> { /* TODO: what does firebase.transaction do? */
			this.onStatusChange('saving');
			if (existingBatchedSteps) { return null; }
			// if (!existingBatchedSteps) {
			// selfChanges[latestKey + 1] = steps
			return {
				s: compressStepsLossy(steps).map((step) => {
					return compressStepJSON(step.toJSON());
				}),
				c: clientId,
				m: meta,
				t: TIMESTAMP,
			};
			// }
		}, (error, committed, dataSnapshot)=> {
			const key = dataSnapshot ? dataSnapshot.key : undefined;
			if (error) {
				console.error('updateCollab', error, steps, clientId, key);
				return null;
			}
			// if (!error) { this.onStatusChange('saved'); }
			this.onStatusChange('saved');
			// const key = dataSnapshot ? dataSnapshot.key : undefined;
			// if (error) {
			// console.error('updateCollab', error, steps, clientId, key);
			if (committed && key % SAVE_EVERY_N_STEPS === 0 && key > 0) {
				// this.updateCheckpoint(newState, key);
				/* Update Checkpoint */
				// const checkpointRef = this.firebaseRef.child('checkpoint');
				// const { d } = compressStateJSON(newState.toJSON());
				this.firebaseRef.child('checkpoint').set({
					d: compressStateJSON(newState.toJSON()).d,
					k: key,
					t: TIMESTAMP
				});
			}
			return true;
		}, false);


		// const recievedClientIds = new Array(steps.length).fill(this.localClientId);
		/* I don't know about commenting this out. */
		// this.selfChanges[this.document.latestKey] = steps;
		// return true;
	}

	onRemoteChange({ isLocal, steps, stepClientIds, changeKey, meta }) {
		console.log('Recieving Remote Steps', steps, isLocal);
		// let receivedSteps;
		// let recievedClientIds;

		// if (isLocal) {
		// 	receivedSteps = this.selfChanges[changeKey];
		// 	recievedClientIds = new Array(receivedSteps.length).fill(this.localClientId);
		// } else {
		// 	receivedSteps = steps;
		// 	recievedClientIds = stepClientIds;
		// }

		const receivedSteps = isLocal
			? this.selfChanges[changeKey]
			: steps;
		const recievedClientIds = isLocal
			? new Array(receivedSteps.length).fill(this.localClientId)
			: stepClientIds;

		/* receiveTransaction sometimes throws a 'Position out of Range' */
		/* error on sync. Not sure why out of range positions are syncing */
		/* in the first place - but it doesn't seem to crash the editor. */
		/* So, let's just catch it instead and move on. */
		/* Well - why could position out of range happen? */
		/* - Three people and you receive a later sync first */
		/* - multiple steps sent up, and the first one is slower for some reason than the first */
		/* - Undo issues? */
		/* I don't quite understand what happens if two syncs send up the same version number */
		try {
			const trans = receiveTransaction(this.view.state, receivedSteps, recievedClientIds);
			if (meta) {
				Object.keys(meta).forEach((metaKey)=> {
					trans.setMeta(metaKey, meta[metaKey]);
				});
			}
			trans.setMeta('receiveDoc', true);
			this.view.dispatch(trans);
			delete this.selfChanges[changeKey];
			return true;
		} catch (err) {
			/* Perhaps if we get here, we need to reload the whole doc - because we're out of sync */
			console.error('In the recieve error place', err);
			return null;
		}
	}

	apply(transaction, state, prevEditorState, editorState) {
		// this.document.removeStaleSelections();
		Object.keys(this.selections).forEach((clientId)=> {
			const originalClientData = this.selections[clientId].data || {};
			const expirationTime = (1000 * 60 * 10); // 10 Minutes
			if (!originalClientData.lastActive
				|| (originalClientData.lastActive + expirationTime) < new Date().getTime()
			) {
				this.firebaseRef.child('selections').child(clientId).remove();
				// const clientSelectionRef = selectionsRef.child(clientId);
				// clientSelectionRef.remove();
			}
		});

		if (transaction.docChanged) {
			// this.document.mapSelection(transaction, editorState);
			Object.keys(this.selections).forEach((clientId)=> {
				const originalClientData = this.selections[clientId].data || {};
				this.selections[clientId] = this.selections[clientId].map(editorState.doc, transaction.mapping);
				this.selections[clientId].data = originalClientData;
			});
		}

		// console.log(transaction, transaction.meta, transaction.selectionSet);
		// if (transaction.getMeta('pointer')) {
		const selection = editorState.selection;
		if (selection instanceof AllSelection === false) {
			// this.document.setSelection(selection);
			// const selectionsRef = this.firebaseRef.child('selections');
			// const selfSelectionRef = selectionsRef.child(this.localClientId);
			const compressed = compressSelectionJSON(selection.toJSON());
			compressed.data = this.localClientData;
			// compressed.data.lastActive has to be rounded to the nearest minute (or some larger value)
			// If it is updated every millisecond, firebase will see it as constant changes
			// And you'll get a loop of updates triggering millisecond updates.
			// - The lastActive is updated anytime a client makes or receives changes.
			// A client will be active even if they have a tab open and are 'watching'. 
			const smoothingTimeFactor = 1000 * 60;
			compressed.data.lastActive = Math.round(new Date().getTime() / smoothingTimeFactor) * smoothingTimeFactor;

			return this.firebaseRef.child('selections').child(this.localClientId).set(compressed);
		}
		// }

		return {};
	}

	updateClientSelection(snapshot) {
		const clientID = snapshot.key;
		if (clientID !== this.localClientId) {
			const compressedSelection = snapshot.val();
			if (compressedSelection) {
				try {
					/* Sometimes, because the selection syncs before the doc, the */
					/* selection location is larger than the doc size. */
					/* Math.min the anchor and head to prevent this from being an issue */
					const docSize = this.view.state.doc.content.size;
					const correctedSelection = uncompressSelectionJSON(compressedSelection);
					correctedSelection.anchor = Math.min(docSize, correctedSelection.anchor);
					correctedSelection.head = Math.min(docSize, correctedSelection.head);
					this.selections[clientID] = Selection.fromJSON(this.view.state.doc, correctedSelection);
					this.selections[clientID].data = compressedSelection.data;
				} catch (error) {
					console.error('updateClientSelection', error);
				}
			} else {
				delete this.selections[clientID];
			}
			this.issueEmptyTransaction();
		}
	}


	deleteClientSelection(snapshot) {
		const clientID = snapshot.key;
		delete this.selections[clientID];
		if (this.onClientChange) {
			this.onClientChange(Object.keys(this.selections).map((key)=> {
				return this.selections[key].data;
			}));
		}
		this.issueEmptyTransaction();
	}
	issueEmptyTransaction() {
		this.view.dispatch(this.view.state.tr);
	}

	addClientSelection(snapshot) {
		this.updateClientSelection(snapshot);
		if (this.onClientChange) {
			this.onClientChange(Object.keys(this.selections).map((key)=> {
				return this.selections[key].data;
			}));
		}
	}

	updateView(view) {
		this.view = view;
		this.loadDocument();
		return {
			update: (newView) => { this.view = newView; },
			destroy: () => { this.view = null; }
		};
	}

	// commit = ({ description, uuid, steps, start, end }) => {
	// 	return this.document.commit({ description, uuid, steps, start, end });
	// }

	// fork = () => {
	// 	const forkID = this.editorKey + Math.round(Math.random() * 1000);
	// 	return this.document.copyDataForFork(this.editorKey).then((fork) => {
	// 		return this.rootRef.ref(forkID).set(fork).then(() => {
	// 			this.document.ref.child('forks').child(forkID).set(true);
	// 			return forkID;
	// 		});
	// 	});
	// }

	// getForks = () => {
	// 	return this.document.getForks().then((forkNames) => {
	// 		const getForkList = forkNames.map((forkName) => {
	// 			return this.rootRef.ref(`${forkName}/forkMeta`).once('value').then((snapshot) => {
	// 				const forkMeta = snapshot.val();
	// 				forkMeta.name = forkName;
	// 				return forkMeta;
	// 			});
	// 		});
	// 		return Promise.all(getForkList);
	// 	});
	// }

	disconnect() {
		this.firebaseApp.delete();
	}

	decorations(state) {
		// if (!this.document) { return null; }

		/* Remove inactive cursor bubbles */
		const selectionKeys = Object.keys(this.selections);
		const existingElements = document.getElementsByClassName('left-cursor');
		for (let index = 0; index < existingElements.length; index += 1) {
			const domItemClientId = existingElements[index].id.replace('cursor-', '');
			const itemIndex = selectionKeys.indexOf(domItemClientId);
			if (itemIndex === -1) {
				existingElements[index].remove();
			}
		}

		return DecorationSet.create(state.doc, selectionKeys.map((clientId)=> {
			const selection = this.selections[clientId];
			const data = selection.data || {};
			if (!selection) {
				return null;
			}
			const { from, to } = selection;
			if (clientId === this.localClientId) {
				return null;
			}
			if (from === to) {
				// const toPos = selection.$to.pos;
				// if (!toPos) { return null; }
				if (!to) { return null; }
				let cursorCoords;
				try {
					// cursorCoords = this.view.coordsAtPos(toPos);
					cursorCoords = this.view.coordsAtPos(to);
				} catch (err) {
					return null;
				}

				const rootElem = document.getElementById(`cursor-container-${this.editorKey}`);
				if (!rootElem) { return null; }
				const rootElemCoords = rootElem.getBoundingClientRect();
				const existingCursor = document.getElementById(`cursor-${clientId}`);
				const currentCursor = existingCursor || document.createElement('span');

				/* If no cursor yet - create it and its children */
				if (!existingCursor) {
					currentCursor.id = `cursor-${clientId}`;
					currentCursor.className = 'left-cursor';
					rootElem.appendChild(currentCursor);

					if (data.image) {
						const cursorImage = document.createElement('img');
						cursorImage.className = `image ${data.id}`;
						cursorImage.src = data.image;
						currentCursor.appendChild(cursorImage);
					}

					const cursorInitials = document.createElement('span');
					cursorInitials.className = `initials ${data.id}`;
					if (!data.image && data.initials) {
						cursorInitials.textContent = data.initials;
					}
					if (data.cursorColor) {
						cursorInitials.style.backgroundColor = data.cursorColor;
					}
					currentCursor.appendChild(cursorInitials);

					if (data.name) {
						const cursorName = document.createElement('span');
						cursorName.className = `name ${data.id}`;
						cursorName.textContent = data.name;
						if (data.cursorColor) {
							cursorName.style.backgroundColor = data.cursorColor;
						}
						currentCursor.appendChild(cursorName);
					}
				}

				const top = `${cursorCoords.top - rootElemCoords.top}px`;
				currentCursor.style.transform = `translate3d(-25px, ${top}, 0)`;


				// 	const elem = document.createElement('span');
				// 	elem.className = `collab-cursor ${data.id}`;

				// 	/* Add Vertical Bar */
				// 	const innerChildBar = document.createElement('span');
				// 	innerChildBar.className = 'inner-bar';
				// 	elem.appendChild(innerChildBar);

				// 	const style = document.createElement('style');
				// 	elem.appendChild(style);
				// 	let innerStyle = '';

				// 	/* Add small circle at top of bar */
				// 	const innerChildCircleSmall = document.createElement('span');
				// 	innerChildCircleSmall.className = `inner-circle-small ${data.id}`;
				// 	innerChildBar.appendChild(innerChildCircleSmall);

				// 	/* Add wrapper for hover items at top of bar */
				// 	const hoverItemsWrapper = document.createElement('span');
				// 	hoverItemsWrapper.className = 'hover-wrapper';
				// 	innerChildBar.appendChild(hoverItemsWrapper);

				// 	/* Add Large Circle for hover */
				// 	const innerChildCircleBig = document.createElement('span');
				// 	innerChildCircleBig.className = 'inner-circle-big';
				// 	hoverItemsWrapper.appendChild(innerChildCircleBig);

				// 	/* If Initials exist - add to hover items wrapper */
				// 	if (data.initials) {
				// 		const innerCircleInitials = document.createElement('span');
				// 		innerCircleInitials.className = `initials ${data.id}`;
				// 		innerStyle += `.initials.${data.id}::after { content: "${data.initials}"; } `;
				// 		hoverItemsWrapper.appendChild(innerCircleInitials);
				// 	}
				// 	/* If Image exists - add to hover items wrapper */
				// 	if (data.image) {
				// 		const innerCircleImage = document.createElement('span');
				// 		innerCircleImage.className = `image ${data.id}`;
				// 		innerStyle += `.image.${data.id}::after { background-image: url('${data.image}'); } `;
				// 		hoverItemsWrapper.appendChild(innerCircleImage);
				// 	}

				// 	/* If name exists - add to hover items wrapper */
				// 	if (data.name) {
				// 		const innerCircleName = document.createElement('span');
				// 		innerCircleName.className = `name ${data.id}`;
				// 		innerStyle += `.name.${data.id}::after { content: "${data.name}"; } `;
				// 		if (data.cursorColor) {
				// 			innerCircleName.style.backgroundColor = data.cursorColor;
				// 		}
				// 		hoverItemsWrapper.appendChild(innerCircleName);
				// 	}

				// 	/* If cursor color provided - override defaults */
				// 	if (data.cursorColor) {
				// 		innerChildBar.style.backgroundColor = data.cursorColor;
				// 		innerChildCircleSmall.style.backgroundColor = data.cursorColor;
				// 		innerChildCircleBig.style.backgroundColor = data.cursorColor;
				// 		innerStyle += `.name.${data.id}::after { background-color: ${data.cursorColor} !important; } `;
				// 	}
				// 	style.innerHTML = innerStyle;

				/* This custom Decoration funkiness is because we don't want the cursor to */
				/* be contenteditable="false". This will break spellcheck. So instead */
				/* we do a bunch of specific :after elements and custom styles */
				/* to build the rich cursor UI */
				// return new Decoration(from, from, new CursorType(elem, {}));
				// return new Decoration.widget(from, elem);
				// return Decoration.widget(from, elem, {
				// 	stopEvent: (event)=> {
				// 		console.log('Heyo', event);
				// 	},
				// 	key: `cursor-${data.id}`,
				// });
			}
			return Decoration.inline(from, to, {
				class: `collab-selection ${data.id}`,
				style: `background-color: ${data.backgroundColor || 'rgba(0, 25, 150, 0.2)'};`,
			});
		}).filter((dec) => {
			return !!dec;
		}));
	}
}

export default CollaborativePlugin;
