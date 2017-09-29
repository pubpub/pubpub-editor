import { AllSelection, EditorState, Plugin } from 'prosemirror-state';
import { Decoration, DecorationSet } from 'prosemirror-view';
import { receiveTransaction, sendableSteps } from 'prosemirror-collab';
import firebase from 'firebase';
import DocumentRef from './documentRef';

const stringToColor = (string, alpha = 1)=> {
	const hue = string.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0) % 360;
	return `hsla(${hue}, 100%, 50%, ${alpha})`;
};

class WidgetType {
  constructor(widget, spec) {
    this.spec = spec || noSpec
    this.side = this.spec.side || 0

    if (!this.spec.raw) {
      if (widget.nodeType != 1) {
        let wrap = document.createElement("span")
        wrap.appendChild(widget)
        widget = wrap
      }
      widget.contentEditable = true
      widget.classList.add("ProseMirror-widget-weee")
    }
    this.widget = widget
  }

  map(mapping, span, offset, oldOffset) {
    let {pos, deleted} = mapping.mapResult(span.from + oldOffset, this.side < 0 ? -1 : 1)
    return deleted ? null : new Decoration(pos - offset, pos - offset, this)
  }

  valid() { return true }

  eq(other) {
    return this == other ||
      (other instanceof WidgetType && (this.widget == other.widget || this.spec.key) &&
       compareObjs(this.spec, other.spec))
  }
}

class FirebasePlugin extends Plugin {
	constructor({ localClientId, localClientData, editorKey, firebaseConfig, rootRef, editorRef, pluginKey, onClientChange }) {
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

		console.log('In the FirebasePlugin constructor');
		this.onClientChange = onClientChange;
		this.localClientId = localClientId;
		this.localClientData = localClientData;
		this.editorKey = editorKey;
		this.selfChanges = {};

		const existingApp = firebase.apps.reduce((prev, curr)=> {
			if (curr.name === editorKey) { return curr; }
			return prev;
		}, undefined);
		// This isn't quite right
		if (!existingApp) {
			this.firebaseApp = firebase.initializeApp(firebaseConfig, editorKey);
		} else {
			console.log(existingApp);
			this.firebaseApp = existingApp;
		// 	console.log('Trying to go online');
		// 	// firebase.database().goOnline();
		}

		if (firebaseConfig) {
			// firebaseDb = firebase.database();
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

	fork = (forkID) => {
		this.document.copyDataForFork().then((fork) => {
			this.rootRef.ref(forkID).set(fork, function(error) {
				if (!error) {
					this.document.ref.child('forks').child(forkID).set(true);
					resolve(forkID);
				} else {
					reject(error);
				}
			});
		});
	}

	getForks = () => {
		return this.document.getForks().then((forkNames) => {
			const getForkList = forkNames.map((forkName) => {
				return this.rootRef.child(`${forkName}/forkMeta`).once('value').then((snapshot) => {
					const forkMeta = snapshot.val();
					forkMeta.name = forkName;
					return forkMeta;
				});
			});
			return Promise.all(getForkList);
		});
	}

	disconnect = ()=> {
		// This isn't quite right
		this.firebaseApp.delete();
		// console.log(firebase.apps);
		// firebase.app().delete().then(()=> {
		console.log('delete it');
		// 	console.log(firebase.apps);	
		// });
		
		// this.document.removeSelfSelection();
		// firebase.database().goOffline();
	}

	decorations = (state) => {
		// return null;
		if (!this.document) { return null; }
		return DecorationSet.create(state.doc, Object.keys(this.document.selections).map((clientID)=> {
			const selection = this.document.selections[clientID];
			const data = selection.data || {};
			if (!selection) {
				return null;
			}
			const { from, to } = selection;

			if (clientID === this.localClientId) {
				return null;
			}
			if (from === to) {
				// Create element in element here.
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
					// innerCircleInitials.textContent = data.initials;
					innerStyle += `.initials.${data.id}::after { content: "${data.initials}"; } `;
					hoverItemsWrapper.appendChild(innerCircleInitials);
				}
				/* If Image exists - add to hover items wrapper */
				if (data.image) {
					// const innerCircleImage = document.createElement('img');
					const innerCircleImage = document.createElement('span');
					innerCircleImage.className = `image ${data.id}`;
					// innerCircleImage.src = data.image;
					innerStyle += `.image.${data.id}::after { background-image: url('${data.image}'); } `;
					hoverItemsWrapper.appendChild(innerCircleImage);
				}

				/* If name exists - add to hover items wrapper */
				if (data.name) {
					const innerCircleName = document.createElement('span');
					innerCircleName.className = `name ${data.id}`;
					// innerCircleName.textContent = data.name;
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

				// return Decoration.widget(from, elem);
				return new Decoration(from, from, new WidgetType(elem, {}));
				// setTimeout(()=> {
				// 	const wrapper = document.getElementsByClassName(`collab-cursor ${data.id}`)[0];
				// 	wrapper.appendChild(elem);
				// }, 1000);
				// return Decoration.inline(from, from + 1, { class: `collab-cursor ${data.id}` });
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
