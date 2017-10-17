import { AllSelection, EditorState, Plugin } from 'prosemirror-state';
import { Decoration, DecorationSet } from 'prosemirror-view';
import { receiveTransaction, sendableSteps } from 'prosemirror-collab';
import firebase from 'firebase';
// import CursorType from './CursorType';
import DocumentRef from './documentRef';


class FirebasePlugin extends Plugin {
	constructor({ localClientId, localClientData, editorKey, firebaseConfig, rootRef, editorRef, pluginKey, onClientChange, onForksUpdate }) {
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

		this.onForksUpdate = onForksUpdate;
		this.onClientChange = onClientChange;
		this.localClientId = localClientId;
		this.localClientData = localClientData;
		this.editorKey = editorKey;
		this.selfChanges = {};

		const existingApp = firebase.apps.reduce((prev, curr)=> {
			if (curr.name === editorKey) { return curr; }
			return prev;
		}, undefined);

		if (!existingApp) {
			this.firebaseApp = firebase.initializeApp(firebaseConfig, editorKey);
		} else {
			this.firebaseApp = existingApp;
		}

		if (firebaseConfig) {
			this.rootRef = firebase.database(this.firebaseApp);
			this.rootRef.goOnline();
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
		this.document = new DocumentRef(this.firebaseRef, this.view, this.localClientId, this.localClientData);
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
			if (this.onForksUpdate) {
				this.getForks().then((forks) => {
					this.onForksUpdate(forks);
				});
			}
		});
	}

	sendCollabChanges = (transaction, newState) => {
		const { meta } = transaction;

		// if (newState !== this.view.state) {
		// 	console.log('FREAK OUT AABOUT STATE');
		// 	debugger;
		// }
		if (meta.collab$ || meta.rebase || meta.footnote) {
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
		/* Don't send any keys with '$' in it to firebase */
		Object.keys(meta).forEach((key)=> {
			if (key.indexOf('$') > -1) {
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
		} else {
			receivedSteps = steps;
			recievedClientIDs = stepClientIDs;
		}
		const trans = receiveTransaction(this.view.state, receivedSteps, recievedClientIDs);
		if (meta) {
			Object.keys(meta).forEach((metaKey)=> {
				trans.setMeta(metaKey, meta[metaKey]);
			});
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
		// if (transaction.getMeta('pointer')) {
		const selection = editorState.selection;
		if (selection instanceof AllSelection === false) {
			this.document.setSelection(selection);
		}
		// }

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
				// firebase.app().delete();
			}
		};
	}

	commit = ({ description, uuid, steps, start, end }) => {
		return this.document.commit({ description, uuid, steps, start, end });
	}

	fork = () => {
		const forkID = this.editorKey + Math.round(Math.random() * 1000);
		return this.document.copyDataForFork(this.editorKey).then((fork) => {
			return this.rootRef.ref(forkID).set(fork).then(() => {
				this.document.ref.child('forks').child(forkID).set(true);
				return forkID;
			});
		});
	}

	getForks = () => {
		return this.document.getForks().then((forkNames) => {
			const getForkList = forkNames.map((forkName) => {
				return this.rootRef.ref(`${forkName}/forkMeta`).once('value').then((snapshot) => {
					const forkMeta = snapshot.val();
					forkMeta.name = forkName;
					return forkMeta;
				});
			});
			return Promise.all(getForkList);
		});
	}

	disconnect = ()=> {
		this.firebaseApp.delete();
	}

	decorations = (state) => {
		if (!this.document) { return null; }

		/* Remove inactive cursor bubbles */
		const selectionKeys = Object.keys(this.document.selections);
		const existingElements = document.getElementsByClassName('left-cursor');
		for (let index = 0; index < existingElements.length; index++) {
			const domItemClientId = existingElements[index].id.replace('cursor-', '');
			const itemIndex = selectionKeys.indexOf(domItemClientId);
			if (itemIndex === -1) {
				existingElements[index].remove();
			}
		}

		return DecorationSet.create(state.doc, selectionKeys.map((clientId)=> {
			const selection = this.document.selections[clientId];
			const data = selection.data || {};
			if (!selection) {
				return null;
			}
			const { from, to } = selection;

			if (clientId === this.localClientId) {
				return null;
			}
			if (from === to) {
				const toPos = selection.$to.pos;
				if (!toPos) { return null; }
				let cursorCoords;
				try {
					cursorCoords = this.view.coordsAtPos(toPos);
				} catch(err) {
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

export default FirebasePlugin;
