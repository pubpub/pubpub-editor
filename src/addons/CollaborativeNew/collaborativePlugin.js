/* eslint-disable no-console */
import { AllSelection, EditorState, Plugin, Selection } from 'prosemirror-state';
import { Decoration, DecorationSet } from 'prosemirror-view';
import { receiveTransaction, sendableSteps } from 'prosemirror-collab';
import { Step } from 'prosemirror-transform';
import { Node } from 'prosemirror-model';
import { compressSelectionJSON, compressStateJSON, compressStepJSON, compressStepsLossy, uncompressSelectionJSON, uncompressStateJSON, uncompressStepJSON } from 'prosemirror-compress';
import firebase from 'firebase';
import CursorType from './CursorType';
// import DocumentRef from './documentRef';


// Okay - so a delay in sendChanges causes the steps to show up out of order.
// If they show up out of order, they are jumbled on the server.
// The local client doesn't see that though.
// Then, once another tab edits, it is subject to IndexOutOfRange on the original, because the jumble is longer
// This indexOutOfRange dude, if he edits (since we just pass over the exception), creates edit that don't make any sense and cause heal database.


// For Thursday/Friday
// We're still getting multiple calls to loadDocument that I don't understand
// as evidenced by the need for setChangeListener
// Figure that out, and figure out how to better handle selections.
// It seems we're also getting clients thingking they are the authority. probably
// because we are wiping selections when we reset? Rather than wipe completely
// we should just set their indexes back to 1 or something.

// Collaborative selections and debugging
// Not-authority clients should still stop processing if they see the authority failed locally. They just aren't responsible for removal. We want to avoid getting an error that prohibits us from listening for remove.

// We need to determine an authority that is building only the server steps. If that fails,
// we remove those steps, and restart all clients.
// Is there any danger in having everyone be an authority?
// onDelete you restart!

const TIMESTAMP = { '.sv': 'timestamp' };
const SAVE_EVERY_N_STEPS = 100;

class CollaborativePlugin extends Plugin {
	constructor({ pluginKey, firebaseConfig, localClientData, localClientId, editorKey, onClientChange, onStatusChange }) {
		super({ key: pluginKey });
		/* Bind plugin functions */
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
		this.restartCollab = this.restartCollab.bind(this);
		this.listenToChanges = this.listenToChanges.bind(this);

		/* Make passed props accessible */
		this.localClientData = localClientData;
		this.localClientId = localClientId;
		this.editorKey = editorKey;
		this.onClientChange = onClientChange;
		this.onStatusChange = onStatusChange;


		/* Init plugin variables */
		this.selfChanges = {};
		this.startedLoad = false;
		this.latestKey = null;
		this.latestRemoteKey = null;
		this.selections = {};
		this.view = null;
		this.authorityDoc = null;
		this.setChangeListener = false;

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

		/* Check for firebaseConfig */
		if (!firebaseConfig) {
			throw new Error('Did not include a firebase config');
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

		/* Set user status and watch for status changes */
		const connectedRef = this.rootRef.ref('.info/connected');
		connectedRef.on('value', (snapshot)=> {
			if (snapshot.val() === true) {
				this.onStatusChange('connected');
			} else {
				this.onStatusChange('disconnected');
			}
		});
	}

	compressedStepJSONToStep(compressedStepJSON) {
		return Step.fromJSON(this.view.state.schema, uncompressStepJSON(compressedStepJSON));
	}

	disconnect() {
		this.firebaseApp.delete();
	}

	restartCollab() {
		console.log('Top of restartCollab');
		if (!this.startedLoad) { return null; }
		/* Unbind firebase listening that will be */
		/* re-initialized in loadDocument */
		console.log('**Calling off once');
		this.firebaseRef.child('changes').off('child_added', this.listenToChanges);
		const selectionsRef = this.firebaseRef.child('selections');
		selectionsRef.off('child_added', this.addClientSelection);
		selectionsRef.off('child_changed', this.updateClientSelection);
		selectionsRef.off('child_removed', this.deleteClientSelection);

		/* Re-initialize plugin variables and reload */
		this.selfChanges = {};
		this.startedLoad = false;
		this.latestKey = null;
		this.latestRemoteKey = null;
		// this.selections = {};
		Object.keys(this.selections).forEach((selectionId)=> {
			this.selections[selectionId] = undefined;
		});
		this.authorityDoc = null;
		this.setChangeListener = false;
		this.loadDocument();
		return true;
	}

	loadDocument() {
		if (this.startedLoad) { return null; }
		console.log('Top of loadDocument');
		this.startedLoad = true;

		/* Listen for remove changes in case we need to restart the doc */
		this.firebaseRef.child('changes').once('child_removed', this.restartCollab);

		/* Begin by loading the checkpoint if available */
		return this.firebaseRef.child('checkpoint').once('value')
		.then((checkpointSnapshot) => {
			const checkpointSnapshotVal = checkpointSnapshot.val() || {};
			const checkpointSnapshotDoc = checkpointSnapshotVal.d;
			const checkpointSnapshotKey = checkpointSnapshotVal.k;
			const checkpointKey = Number(checkpointSnapshotKey) || 0;
			const newDoc = checkpointSnapshotDoc && Node.fromJSON(this.view.state.schema, uncompressStateJSON({ d: checkpointSnapshotDoc }).doc);
			this.latestKey = checkpointKey;

			/* Get all changes since checkpoint (or since 0 if no checkpoint */
			const getChanges = this.firebaseRef.child('changes')
			.orderByKey()
			.startAt(String(checkpointKey + 1))
			.once('value');

			return Promise.all([newDoc, getChanges]);
		})
		.then(([newDoc, changesSnapshot])=> {
			const changesSnapshotVal = changesSnapshot.val() || {};
			const steps = [];
			const stepClientIds = [];
			const keys = Object.keys(changesSnapshotVal);
			const stepsWithKeys = [];
			this.latestKey = keys.length ? Math.max(...keys) : this.latestKey;
			this.latestRemoteKey = this.latestKey;
			keys.forEach((key)=> {
				const compressedStepsJSON = changesSnapshotVal[key].s;
				const uncompressedSteps = compressedStepsJSON.map(this.compressedStepJSONToStep);
				stepsWithKeys.push({ key, steps: uncompressedSteps });
				steps.push(...compressedStepsJSON.map(this.compressedStepJSONToStep));
				stepClientIds.push(...new Array(compressedStepsJSON.length).fill('_server'));
			});

			const docToUse = newDoc || Node.fromJSON(this.view.state.schema, { type: 'doc', attrs: { meta: {} }, content: [{ type: 'paragraph' }] });
			this.view.updateState(EditorState.create({
				doc: docToUse,
				plugins: this.view.state.plugins,
			}));
			this.authorityDoc = docToUse;

			/* Test steps with authority doc. */
			stepsWithKeys.sort((foo, bar)=> {
				if (Number(foo.key) < Number(bar.key)) { return -1; }
				if (Number(foo.key) > Number(bar.key)) { return 1; }
				return 0;
			}).forEach((stepObject)=> {
				try {
					stepObject.steps.forEach((step)=> {
						this.authorityDoc = step.apply(this.authorityDoc).doc;
						if (!this.authorityDoc) { throw new Error(`Invalid Authority Doc ${stepObject.key}`); }
					});
				} catch (err) {
					throw new Error(`Invalid Authority Doc ${stepObject.key}`);
				}
			});

			const trans = receiveTransaction(this.view.state, steps, stepClientIds);
			trans.setMeta('receiveDoc', true);
			this.view.dispatch(trans);
			console.log('LoadDoc10');

			/* Why is this being fired more than once? That needs to be resolved first */
			if (!this.setChangeListener) {
				/* Listen to Selections Change */
				const selectionsRef = this.firebaseRef.child('selections');
				selectionsRef.child(this.localClientId).onDisconnect().remove();
				selectionsRef.on('child_added', this.addClientSelection);
				selectionsRef.on('child_changed', this.updateClientSelection);
				selectionsRef.on('child_removed', this.deleteClientSelection);

				/* Listen to Changes */
				console.log('**Calling on once');
				this.firebaseRef.child('changes')
				.orderByKey()
				.startAt(String(this.latestKey + 1))
				.on('child_added', this.listenToChanges);
				this.setChangeListener = true;
			} else {
				console.log('Ya - were still getting multiple calls for On');
			}

			return true;
		})
		.catch((err)=> {
			console.log('In catch with ', err, err.message);
			if (err.message.indexOf('Invalid Authority Doc') > -1) {
				const stepToDelete = Number(err.message.replace('Invalid Authority Doc ', ''));
				const sortedClientIds = [...Object.keys(this.selections), this.localClientId].sort((foo, bar)=> {
					if (foo > bar) { return 1; }
					if (foo < bar) { return -1; }
					return 0;
				});
				if (sortedClientIds[0] === this.localClientId) {
					console.log('Loading We should delete ', stepToDelete);
					this.firebaseRef.child('changes').child(stepToDelete).remove();
				}
			}
		});
	}

	listenToChanges(snapshot) {
		if (!this.startedLoad) { console.log('You shouldnt be here!'); return null; }

		this.latestKey = Number(snapshot.key);
		const snapshotVal = snapshot.val();
		const compressedStepsJSON = snapshotVal.s;
		const clientId = snapshotVal.c;
		const meta = snapshotVal.m;

		const changeSteps = compressedStepsJSON.map(this.compressedStepJSONToStep);
		const changeStepClientIds = new Array(changeSteps.length).fill(clientId);
		let didRemoveChange;
		try {
			changeSteps.forEach((step)=> {
				this.authorityDoc = step.apply(this.authorityDoc).doc;
				if (!this.authorityDoc) { throw new Error('Empty Authority Doc'); }
			});
		} catch (err) {
			didRemoveChange = true;

			const sortedClientIds = [...Object.keys(this.selections), this.localClientId].sort((foo, bar)=> {
				if (foo > bar) { return 1; }
				if (foo < bar) { return -1; }
				return 0;
			});
			console.log(sortedClientIds[0], this.localClientId, sortedClientIds[0] === this.localClientId);
			if (sortedClientIds[0] === this.localClientId) {
				console.log('Listening We should delete ', snapshot.key, err);
				this.firebaseRef.child('changes').child(snapshot.key).remove();
			}
		}

		if (didRemoveChange) { return null; }

		/* TODO: This if statement doesn't seem quite right. Shouldnt we be sending the changes, and 
		then dealing with thether they are local by ID? Why would we use the localChanges object at all?
		Just to save the compress step? */
		const changes = clientId === this.localClientId
			? {
				isLocal: true,
				steps: changeSteps,
				stepClientIds: changeStepClientIds,
				meta: meta,
				changeKey: this.latestKey
			}
			: {
				steps: changeSteps,
				stepClientIds: changeStepClientIds,
				meta: meta,
				changeKey: this.latestKey
			};
		return this.onRemoteChange(changes);
	}

	sendCollabChanges(transaction, newState) {
		if (!this.startedLoad) { console.log('You shouldnt be here!'); return null; }

		const meta = transaction.meta;
		if (meta.collab$ || meta.rebase || meta.footnote || meta.newSelection || meta.clearTempSelection) {
			return null;
		}

		/* Don't send certain keys with to firebase */
		Object.keys(meta).forEach((key)=> {
			if (key.indexOf('$') > -1
				|| key === 'addToHistory'
				|| key === 'pointer'
			) {
				delete meta[key];
			}
		});

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
		this.latestKey = this.latestKey + 1; /* TODO - why do we increment here, as opposed to listening on firebase? */
		this.selfChanges[this.latestKey] = steps;

		return this.firebaseRef.child('changes').child(this.latestKey)
		.transaction((existingBatchedSteps)=> { /* TODO: what does firebase.transaction do? */
			this.onStatusChange('saving');

			if (existingBatchedSteps) { return null; }
			return {
				s: compressStepsLossy(steps).map((step) => {
					return compressStepJSON(step.toJSON());
				}),
				c: clientId,
				m: meta,
				t: TIMESTAMP,
			};
		}, (error, committed, dataSnapshot)=> {
			const key = dataSnapshot ? dataSnapshot.key : undefined;
			if (error) {
				console.error('updateCollab', error, steps, clientId, key);
				return null;
			}

			this.onStatusChange('saved');
			if (committed && key % SAVE_EVERY_N_STEPS === 0 && key > 0) {
				/* Update Checkpoint */
				this.firebaseRef.child('checkpoint').set({
					d: compressStateJSON(newState.toJSON()).d,
					k: key,
					t: TIMESTAMP
				});
			}
			return true;
		}, false);
	}

	onRemoteChange({ isLocal, steps, stepClientIds, changeKey, meta }) {
		console.log(this.selfChanges, changeKey);
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

		/* I'm going to comment this try - because really this error should never happen - given */
		/* we are testing against the authority doc */
		// try {
		const trans = receiveTransaction(this.view.state, receivedSteps, recievedClientIds);
		if (meta) {
			Object.keys(meta).forEach((metaKey)=> {
				trans.setMeta(metaKey, meta[metaKey]);
			});
		}
		trans.setMeta('receiveDoc', true);
		this.view.dispatch(trans);
		delete this.selfChanges[changeKey];
		this.latestRemoteKey = changeKey;
		return true;
		// } catch (err) {
		// /* Perhaps if we get here, we need to reload the whole doc - because we're out of sync */
		// 	console.error('In the recieve error place', err);
		// 	return null;
		// }
	}

	apply(transaction, state, prevEditorState, editorState) {
		/* Remove Stale Selections */
		Object.keys(this.selections).forEach((clientId)=> {
			const originalClientData = this.selections[clientId] ? this.selections[clientId].data : {};
			const expirationTime = (1000 * 60 * 10); // 10 Minutes
			const lastActiveExpired = (originalClientData.lastActive + expirationTime) < new Date().getTime();
			if (!originalClientData.lastActive || lastActiveExpired) {
				this.firebaseRef.child('selections').child(clientId).remove();
			}
		});

		/* Map Selection */
		if (transaction.docChanged) {
			Object.keys(this.selections).forEach((clientId)=> {
				const originalClientData = this.selections[clientId] ? this.selections[clientId].data : {};
				this.selections[clientId] = this.selections[clientId].map(editorState.doc, transaction.mapping);
				this.selections[clientId].data = originalClientData;
			});
		}

		/* Set Selection */
		const selection = editorState.selection;
		if (selection instanceof AllSelection === false) {
			const compressed = compressSelectionJSON(selection.toJSON());
			compressed.data = this.localClientData;

			/* compressed.data.lastActive has to be rounded to the nearest minute (or some larger value)
			If it is updated every millisecond, firebase will see it as constant changes
			And you'll get a loop of updates triggering millisecond updates.
			- The lastActive is updated anytime a client makes or receives changes.
			A client will be active even if they have a tab open and are 'watching'. */
			const smoothingTimeFactor = 1000 * 60;
			compressed.data.lastActive = Math.round(new Date().getTime() / smoothingTimeFactor) * smoothingTimeFactor;
			compressed.data.version = this.latestKey;

			return this.firebaseRef.child('selections').child(this.localClientId).set(compressed);
		}

		return {};
	}

	issueEmptyTransaction() {
		this.view.dispatch(this.view.state.tr);
	}

	updateClientSelection(snapshot) {
		/* Called on firebase updates to selection */
		const clientID = snapshot.key;
		if (clientID !== this.localClientId) {
			const compressedSelection = snapshot.val();
			if (compressedSelection && this.latestRemoteKey === compressedSelection.data.version) {
				// console.log(`Latest Local Key: ${this.latestKey} - remote client version: ${compressedSelection.data.version} - latest remote key: ${this.latestRemoteKey}`);
				// const selection = uncompressSelectionJSON(compressedSelection);
				// this.selections[clientID] = Selection.fromJSON(this.view.state.doc, selection);
				// this.selections[clientID].data = compressedSelection.data;

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
			// console.log(this.selections);
			this.issueEmptyTransaction();
		}
	}

	addClientSelection(snapshot) {
		this.updateClientSelection(snapshot);
		if (this.onClientChange) {
			this.onClientChange(Object.keys(this.selections).map((key)=> {
				return this.selections[key].data;
			}));
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

	updateView(view) {
		console.log('In view');
		this.view = view;
		this.loadDocument();
		return {
			update: (newView) => { this.view = newView; },
			destroy: () => { this.view = null; }
		};
	}

	decorations(state) {
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
			if (!selection) { return null; }

			const data = selection.data || {};
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


				const elem = document.createElement('span');
				elem.className = `collab-cursor ${data.id}`;

				/* Add Vertical Bar */
				const innerChildBar = document.createElement('span');
				innerChildBar.className = 'inner-bar';
				elem.appendChild(innerChildBar);

				const style = document.createElement('style');
				elem.appendChild(style);
				let innerStyle = '';

				/* Add small circle at top of bar */
				const innerChildCircleSmall = document.createElement('span');
				innerChildCircleSmall.className = `inner-circle-small ${data.id}`;
				innerChildBar.appendChild(innerChildCircleSmall);

				/* Add wrapper for hover items at top of bar */
				const hoverItemsWrapper = document.createElement('span');
				hoverItemsWrapper.className = 'hover-wrapper';
				innerChildBar.appendChild(hoverItemsWrapper);

				/* Add Large Circle for hover */
				const innerChildCircleBig = document.createElement('span');
				innerChildCircleBig.className = 'inner-circle-big';
				hoverItemsWrapper.appendChild(innerChildCircleBig);

				/* If Initials exist - add to hover items wrapper */
				if (data.initials) {
					const innerCircleInitials = document.createElement('span');
					innerCircleInitials.className = `initials ${data.id}`;
					innerStyle += `.initials.${data.id}::after { content: "${data.initials}"; } `;
					hoverItemsWrapper.appendChild(innerCircleInitials);
				}
				/* If Image exists - add to hover items wrapper */
				if (data.image) {
					const innerCircleImage = document.createElement('span');
					innerCircleImage.className = `image ${data.id}`;
					innerStyle += `.image.${data.id}::after { background-image: url('${data.image}'); } `;
					hoverItemsWrapper.appendChild(innerCircleImage);
				}

				/* If name exists - add to hover items wrapper */
				if (data.name) {
					const innerCircleName = document.createElement('span');
					innerCircleName.className = `name ${data.id}`;
					innerStyle += `.name.${data.id}::after { content: "${data.name}"; } `;
					if (data.cursorColor) {
						innerCircleName.style.backgroundColor = data.cursorColor;
					}
					hoverItemsWrapper.appendChild(innerCircleName);
				}

				/* If cursor color provided - override defaults */
				if (data.cursorColor) {
					innerChildBar.style.backgroundColor = data.cursorColor;
					innerChildCircleSmall.style.backgroundColor = data.cursorColor;
					innerChildCircleBig.style.backgroundColor = data.cursorColor;
					innerStyle += `.name.${data.id}::after { background-color: ${data.cursorColor} !important; } `;
				}
				style.innerHTML = innerStyle;

				/* This custom Decoration funkiness is because we don't want the cursor to */
				/* be contenteditable="false". This will break spellcheck. So instead */
				/* we do a bunch of specific :after elements and custom styles */
				/* to build the rich cursor UI */
				return new Decoration(from, from, new CursorType(elem, {}));


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
