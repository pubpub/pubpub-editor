import { AllSelection, EditorState, Plugin, Selection, PluginKey } from 'prosemirror-state';
import { Decoration, DecorationSet } from 'prosemirror-view';
import { collab, receiveTransaction, sendableSteps } from 'prosemirror-collab';
import { Step } from 'prosemirror-transform';
import { Node } from 'prosemirror-model';
import {
	compressSelectionJSON,
	compressStateJSON,
	compressStepJSON,
	uncompressSelectionJSON,
	uncompressStepJSON,
} from 'prosemirror-compress-pubpub';
import { generateHash } from '../utilities';

const TIMESTAMP = { '.sv': 'timestamp' };
const SAVE_EVERY_N_STEPS = 100;

/*	Collab Lifecycle
	================
	1. user input
	2. apply()
	3. sendCollab()
	4. decorations()
	5. view()
	6. receiveCollab()
	7. apply()
	8. sendCollab() [doesn't send due to meta showing the transaction is a collab one]
	9. decorations()
	10. view()
*/

export default (schema, props) => {
	const collabOptions = props.collaborativeOptions;
	if (!collabOptions.firebaseRef) {
		return [];
	}

	const localClientId = `clientId-${collabOptions.clientData.id}-${generateHash(6)}`;

	return [
		collab({
			clientID: localClientId,
		}),
		/* eslint-disable-next-line no-use-before-define */
		new CollaborativePlugin({
			firebaseRef: collabOptions.firebaseRef,
			initialContent: props.initialContent,
			initialDocKey: collabOptions.initialDocKey,
			localClientData: collabOptions.clientData,
			localClientId: localClientId,
			onClientChange: collabOptions.onClientChange || function() {},
			onStatusChange: collabOptions.onStatusChange || function() {},
		}),
	];
};

class CollaborativePlugin extends Plugin {
	constructor(pluginProps) {
		super({ key: new PluginKey('collaborative') });
		this.pluginProps = pluginProps;

		/* Bind plugin functions */
		this.loadDocument = this.loadDocument.bind(this);
		this.receiveCollabChanges = this.receiveCollabChanges.bind(this);
		this.sendCollabChanges = this.sendCollabChanges.bind(this);
		this.addClientSelection = this.addClientSelection.bind(this);
		this.updateClientSelection = this.updateClientSelection.bind(this);
		this.deleteClientSelection = this.deleteClientSelection.bind(this);
		this.issueEmptyTransaction = this.issueEmptyTransaction.bind(this);
		this.setResendTimeout = this.setResendTimeout.bind(this);

		/* Init plugin variables */
		this.startedLoad = false;
		this.mostRecentRemoteKey = pluginProps.initialDocKey;
		this.selections = {};
		this.ongoingTransaction = false;
		this.resendSyncTimeout = undefined;

		/* Setup Prosemirror plugin values */
		this.spec = {
			view: (view) => {
				this.view = view;
				this.loadDocument();
				return {
					update: (newView) => {
						this.view = newView;
					},
				};
			},
			state: {
				init: () => {
					return { isLoaded: false };
				},
				apply: this.apply.bind(this),
			},
		};
		this.props = {
			decorations: this.decorations.bind(this),
		};
	}

	loadDocument() {
		if (this.startedLoad) {
			return null;
		}
		this.startedLoad = true;

		return this.pluginProps.firebaseRef
			.child('changes')
			.orderByKey()
			.startAt(String(this.mostRecentRemoteKey + 1))
			.once('value')
			.then((changesSnapshot) => {
				const changesSnapshotVal = changesSnapshot.val() || {};
				const steps = [];
				const stepClientIds = [];
				const keys = Object.keys(changesSnapshotVal);
				this.mostRecentRemoteKey = keys.length
					? Math.max(...keys)
					: this.mostRecentRemoteKey;

				/* Uncompress steps and add stepClientIds */
				Object.keys(changesSnapshotVal).forEach((key) => {
					const compressedStepsJSON = changesSnapshotVal[key].s;
					const uncompressedSteps = compressedStepsJSON.map((compressedStepJSON) => {
						return Step.fromJSON(
							this.view.state.schema,
							uncompressStepJSON(compressedStepJSON),
						);
					});
					steps.push(...uncompressedSteps);
					stepClientIds.push(
						...new Array(compressedStepsJSON.length).fill(changesSnapshotVal[key].c),
					);
				});

				/* Update the prosemirror view with new doc */
				const newDoc = Node.fromJSON(
					this.view.state.schema,
					this.pluginProps.initialContent,
				);
				this.view.updateState(
					EditorState.create({
						doc: newDoc,
						plugins: this.view.state.plugins,
					}),
				);

				const trans = receiveTransaction(this.view.state, steps, stepClientIds);
				this.view.dispatch(trans);

				/* Listen to Selections Change */
				console.log('about to set listeners');
				const selectionsRef = this.pluginProps.firebaseRef.child('selections');
				selectionsRef
					.child(this.pluginProps.localClientId)
					.onDisconnect()
					.remove();
				selectionsRef.on('child_added', this.addClientSelection);
				selectionsRef.on('child_changed', this.updateClientSelection);
				selectionsRef.on('child_removed', this.deleteClientSelection);

				const finishedLoadingTrans = this.view.state.tr;
				finishedLoadingTrans.setMeta('finishedLoading', true);
				this.view.dispatch(finishedLoadingTrans);

				/* Listen to Changes */
				return this.pluginProps.firebaseRef
					.child('changes')
					.orderByKey()
					.startAt(String(this.mostRecentRemoteKey + 1))
					.on('child_added', this.receiveCollabChanges);
			})
			.catch((err) => {
				console.error('In loadDocument Error with ', err, err.message);
			});
	}

	receiveCollabChanges(snapshot) {
		console.log('in handle remote');
		this.mostRecentRemoteKey = Number(snapshot.key);
		const snapshotVal = snapshot.val();
		const compressedStepsJSON = snapshotVal.s;
		const clientId = snapshotVal.c;
		const meta = snapshotVal.m;

		const newSteps = compressedStepsJSON.map((compressedStepJSON) => {
			return Step.fromJSON(this.view.state.schema, uncompressStepJSON(compressedStepJSON));
		});
		const newStepsClientIds = new Array(newSteps.length).fill(clientId);
		const trans = receiveTransaction(this.view.state, newSteps, newStepsClientIds);

		if (meta) {
			Object.keys(meta).forEach((metaKey) => {
				trans.setMeta(metaKey, meta[metaKey]);
			});
		}

		/* We do getSelection().empty() because of a chrome bug: */
		/* https://discuss.prosemirror.net/t/in-collab-setup-with-selections-cursor-jumps-to-a-different-position-without-selection-being-changed/1011 */
		/* https://github.com/ProseMirror/prosemirror/issues/710 */
		/* https://bugs.chromium.org/p/chromium/issues/detail?id=775939 */
		/* To reproduce, put one cursor in the middle of the last line of the paragraph, */
		/* and then with another cursor begin typing at the end of the paragraph. The typing */
		/* cursor will jump to the location of the middle cursor. */
		// const selection = document.getSelection();
		// const anchorNode = selection.anchorNode || { className: '' };
		// const anchorClasses = anchorNode.className || '';
		// if (
		// 	selection &&
		// 	selection.isCollapsed &&
		// 	anchorClasses.indexOf('options-wrapper') === -1 &&
		// 	this.view.hasFocus()
		// ) {
		// 	document.getSelection().empty();
		// }

		return this.view.dispatch(trans);
	}

	sendCollabChanges(transaction, newState) {
		console.log('in send collab');
		// TODO: Rather than exclude - we should probably explicitly list the types of transactions we accept.
		// Exluding only will break when others add custom plugin transactions.
		const meta = transaction.meta;
		if (
			meta.buildingJSON ||
			meta.finishedLoading ||
			meta.collab$ ||
			meta.rebase ||
			meta.footnote ||
			meta.highlightsToRemove ||
			meta.newHighlightsData ||
			meta.appendedTransaction
		) {
			console.log('in bad meta', meta);
			return null;
		}

		/* Don't send certain keys with to firebase */
		Object.keys(meta).forEach((key) => {
			if (key.indexOf('$') > -1 || key === 'addToHistory' || key === 'pointer') {
				delete meta[key];
			}
		});

		const sendable = sendableSteps(newState);
		if (!sendable) {
			console.log('no sendable');
			return null;
		}

		if (this.ongoingTransaction) {
			/* We only allow one outgoing transaction at a time. Sometimes the
			local view is updated before an ongoing transaction is finished. If this
			is the case, we abort the newly triggered outgoing transaction. If we do
			that, we need to ensure we eventually send the most recent state for
			syncing. This timeout ensures that. */
			this.setResendTimeout();
			return null;
		}

		this.ongoingTransaction = true;
		const steps = sendable.steps;
		const clientId = sendable.clientID;

		return this.pluginProps.firebaseRef
			.child('changes')
			.child(this.mostRecentRemoteKey + 1)
			.transaction(
				(existingRemoteSteps) => {
					this.pluginProps.onStatusChange('saving');
					if (existingRemoteSteps) {
						return undefined;
					}
					return {
						s: steps.map((step) => {
							return compressStepJSON(step.toJSON());
						}),
						c: clientId,
						m: meta,
						t: TIMESTAMP,
					};
				},
				(error, committed, snapshot) => {
					this.ongoingTransaction = false;
					if (error) {
						console.error('Error in sendCollab transaction', error, steps, clientId);
						return null;
					}

					if (committed) {
						this.pluginProps.onStatusChange('saved');

						/* If multiple of SAVE_EVERY_N_STEPS, update checkpoint */
						if (snapshot.key % SAVE_EVERY_N_STEPS === 0) {
							this.pluginProps.firebaseRef.child('checkpoint').set({
								d: compressStateJSON(newState.toJSON()).d,
								k: snapshot.key,
								t: TIMESTAMP,
							});
						}
						/* Update discussion mappings here */
						// TODO
					} else {
						/* If the transaction did not commit changes, we need
						to trigger sendCollabChanges to fire again. */
						this.setResendTimeout();
					}

					return undefined;
				},
				false,
			)
			.catch(() => {
				this.ongoingTransaction = false;
				this.setResendTimeout();
			});
	}

	setResendTimeout() {
		clearTimeout(this.resendSyncTimeout);
		this.resendSyncTimeout = setTimeout(() => {
			this.sendCollabChanges({ meta: {} }, this.view.state);
		}, 2000);
		return null;
	}

	/*
		Only update your own selection in firebase
		Map other selections forward locally when you have a succesful transaction
		On load, remove any selections whose stepNumber is older than your init one.
		Whoever issues the step should issue updates to the discussions, and their selection
		Map all decorations (discussions) locally. We only update the firebase for first load folks
		Otherwise, you update discussions via mapping when you get the new step
		Also have to be watching for new discussions


		Are all decorations the same?
		Get decorations from firebase
		If your number is behind their number - don't display
		If your number is equal to their stepNumber - apply
		As you get new steps, map all decorations forward
		As there is a new decoration, apply it (if steps are equal), and then handle mapping

		For selections - we could make the selections due to clicks, etc have a new id and 'look' new,
		while leaving old ones to expire. They would have to expire as soon as stepNumbers didn't match

		do we need a mostRecentLocalStep? Which we set everytime docChanged and not $collab?

	*/

	apply(transaction, state, prevEditorState, editorState) {
		console.log('in apply', transaction.meta);
		/* Remove Stale Selections */
		Object.keys(this.selections).forEach((clientId) => {
			const originalClientData = this.selections[clientId]
				? this.selections[clientId].data
				: {};
			const expirationTime = 1000 * 60 * 5; /* 5 minutes */
			const lastActiveExpired =
				originalClientData.lastActive + expirationTime < new Date().getTime();
			if (!originalClientData.lastActive || lastActiveExpired) {
				this.pluginProps.firebaseRef
					.child('selections')
					.child(clientId)
					.remove();
			}
		});

		/* Map Selection */
		if (transaction.docChanged && !transaction.meta.buildingJSON) {
			Object.keys(this.selections).forEach((clientId) => {
				if (
					this.selections[clientId] &&
					this.selections[clientId] !== this.pluginProps.localClientId
				) {
					const originalClientData = this.selections[clientId]
						? this.selections[clientId].data
						: {};
					this.selections[clientId] = this.selections[clientId].map(
						editorState.doc,
						transaction.mapping,
					);
					this.selections[clientId].data = originalClientData;
				}
			});
		}

		/* Set Selection */
		const prevSelection = this.selections[this.pluginProps.localClientId] || {};
		const selection = editorState.selection || {};
		const needsToInit = !prevSelection.anchor;
		const isPointer = transaction.meta.pointer;
		const isNotSelectAll = selection instanceof AllSelection === false;
		const isCursorChange =
			!transaction.docChanged &&
			(selection.anchor !== prevSelection.anchor || selection.head !== prevSelection.head);
		if (isNotSelectAll && (needsToInit || isPointer || isCursorChange)) {
			const prevLocalSelectionData = this.selections[this.pluginProps.localClientId] || {};
			const anchorEqual = prevLocalSelectionData.anchor === selection.anchor;
			const headEqual = prevLocalSelectionData.head === selection.head;
			if (!prevLocalSelectionData.anchor || !anchorEqual || !headEqual) {
				const compressed = compressSelectionJSON(selection.toJSON());
				compressed.data = this.pluginProps.localClientData;
				if (needsToInit) {
					compressed.a = 1;
					compressed.h = 1;
				}

				/* compressed.data.lastActive has to be rounded to the nearest minute (or some larger value)
				If it is updated every millisecond, firebase will see it as constant changes and you'll get a 
				loop of updates triggering millisecond updates. The lastActive is updated anytime a client 
				makes or receives changes. A client will be active even if they have a tab open and are 'watching'. */
				const smoothingTimeFactor = 1000 * 60;
				compressed.data.lastActive =
					Math.round(new Date().getTime() / smoothingTimeFactor) * smoothingTimeFactor;

				this.selections[this.pluginProps.localClientId] = selection;
				this.selections[
					this.pluginProps.localClientId
				].data = this.pluginProps.localClientData;
				this.pluginProps.firebaseRef
					.child('selections')
					.child(this.pluginProps.localClientId)
					.set(compressed);
			}
		}
		/* Send Collab Changes */
		this.sendCollabChanges(transaction, editorState);

		if (transaction.meta.finishedLoading) {
			return { isLoaded: true };
		}
		return state;
	}

	issueEmptyTransaction() {
		this.view.dispatch(this.view.state.tr);
	}

	updateClientSelection(snapshot) {
		// Note - we do have something that causes the cursor to bounce, or be mapped incorrectly
		console.log('update client selection');
		/* Called on firebase updates to selection */
		const clientID = snapshot.key;
		if (clientID !== this.pluginProps.localClientId) {
			const snapshotVal = snapshot.val();
			/* Invalid selections can happen if a selection is synced before the corresponding changes from that 
			remote editor. We simply remove the selection in that case, and wait for the proper position to sync. */
			const invalidSelection =
				Math.max(snapshotVal.a, snapshotVal.h) > this.view.state.doc.content.size - 1;
			if (snapshotVal && !invalidSelection) {
				this.selections[clientID] = Selection.fromJSON(
					this.view.state.doc,
					uncompressSelectionJSON(snapshotVal),
				);
				this.selections[clientID].data = snapshotVal.data;
			} else {
				delete this.selections[clientID];
			}
			this.issueEmptyTransaction();
		}
	}

	addClientSelection(snapshot) {
		this.updateClientSelection(snapshot);
		// if (this.pluginProps.onClientChange) {
		this.pluginProps.onClientChange(
			Object.keys(this.selections)
				.filter((key) => {
					return this.selections[key];
				})
				.map((key) => {
					return this.selections[key].data;
				}),
		);
		// }
	}

	deleteClientSelection(snapshot) {
		const clientID = snapshot.key;
		delete this.selections[clientID];
		// if (this.pluginProps.onClientChange) {
		this.pluginProps.onClientChange(
			Object.keys(this.selections)
				.filter((key) => {
					return this.selections[key];
				})
				.map((key) => {
					return this.selections[key].data;
				}),
		);
		// }
		this.issueEmptyTransaction();
	}

	decorations(state) {
		console.log('in decorations');
		const selectionKeys = Object.keys(this.selections);
		const decorations = [];
		selectionKeys.forEach((clientId) => {
			if (clientId === this.pluginProps.localClientId) {
				return null;
			}

			const selection = this.selections[clientId];
			if (!selection) {
				return null;
			}

			const data = selection.data || {};
			// if (!data.canEdit) {
			// 	return null;
			// }

			/* Classnames must begin with letter, so append one single uuid's may not. */
			const formattedDataId = `c-${data.id}`;
			const elem = document.createElement('span');
			elem.className = `collab-cursor ${formattedDataId}`;

			/* Add Vertical Bar */
			const innerChildBar = document.createElement('span');
			innerChildBar.className = 'inner-bar';
			elem.appendChild(innerChildBar);

			const style = document.createElement('style');
			elem.appendChild(style);
			let innerStyle = '';

			/* Add small circle at top of bar */
			const innerChildCircleSmall = document.createElement('span');
			innerChildCircleSmall.className = `inner-circle-small ${formattedDataId}`;
			innerChildBar.appendChild(innerChildCircleSmall);

			/* Add wrapper for hover items at top of bar */
			const hoverItemsWrapper = document.createElement('span');
			hoverItemsWrapper.className = 'hover-wrapper';
			innerChildBar.appendChild(hoverItemsWrapper);

			/* Add Large Circle for hover */
			const innerChildCircleBig = document.createElement('span');
			innerChildCircleBig.className = 'inner-circle-big';
			hoverItemsWrapper.appendChild(innerChildCircleBig);

			/* Just for testing */
			const testComp = document.createElement('span');
			testComp.className = 'test-comp';
			elem.appendChild(testComp);
			/* ---- */

			/* If Initials exist - add to hover items wrapper */
			if (data.initials) {
				const innerCircleInitials = document.createElement('span');
				innerCircleInitials.className = `initials ${formattedDataId}`;
				innerStyle += `.initials.${formattedDataId}::after { content: "${
					data.initials
				}"; } `;
				hoverItemsWrapper.appendChild(innerCircleInitials);
			}
			/* If Image exists - add to hover items wrapper */
			if (data.image) {
				const innerCircleImage = document.createElement('span');
				innerCircleImage.className = `image ${formattedDataId}`;
				innerStyle += `.image.${formattedDataId}::after { background-image: url('${
					data.image
				}'); } `;
				hoverItemsWrapper.appendChild(innerCircleImage);
			}

			/* If name exists - add to hover items wrapper */
			if (data.name) {
				const innerCircleName = document.createElement('span');
				innerCircleName.className = `name ${formattedDataId}`;
				innerStyle += `.name.${formattedDataId}::after { content: "${data.name}"; } `;
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
				innerStyle += `.name.${formattedDataId}::after { background-color: ${
					data.cursorColor
				} !important; } `;
			}
			style.innerHTML = innerStyle;

			const selectionFrom = selection.from;
			const selectionTo = selection.to;
			const selectionHead = selection.head;
			decorations.push(
				Decoration.widget(selectionHead, elem, {
					stopEvent: () => {
						return true;
					},
					key: 'discussion-item-id',
				}),
			);

			if (selectionFrom !== selectionTo) {
				decorations.push(
					Decoration.inline(selectionFrom, selectionTo, {
						class: `collab-selection ${formattedDataId}`,
						style: `background-color: ${data.backgroundColor ||
							'rgba(0, 25, 150, 0.2)'};`,
					}),
				);
			}
			return null;
		});
		return DecorationSet.create(
			state.doc,
			decorations.filter((dec) => {
				return !!dec;
			}),
		);
	}
}

/* Set user status and watch for status changes */
/* TODO - do we pass in the database instead? Or handle this disconnect from above? */
// this.database.ref('.info/connected').on('value', (snapshot) => {
// 	if (snapshot.val() === true) {
// 		this.pluginProps.onStatusChange('connected');
// 	} else {
// 		this.pluginProps.onStatusChange('disconnected');
// 	}
// });
