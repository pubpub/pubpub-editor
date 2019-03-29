// import React from 'react';
// import ReactDOM from 'react-dom';
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
import {
	generateHash,
	restoreDiscussionMaps,
	storeCheckpoint,
	firebaseTimestamp,
} from '../utilities';

/*
	Load doc from firebase
	Generate initialContent
	Pass that into Editor
	Server Render HTML
	On Client, load Editor
	Editor create init doc
	collaborative sets up listeners
	collaborative gets discussions, applies the ones that match the dockey (with no sendable), keeps track of their ids
	non-applied decorations are applied whenever their key matches the mostRecentRemote and there are no sendable steps
*/

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

// Maybe only accept a new discussion if the remoteStep matches.
// Since remoteStepKeys are updated each time
// Probably want to rename 'selections' to 'cursors' in firebase

/*
cursors: {
	clientId: {
		backgroundColor
		color
		name
		selection: {
			a
			h
			type
		}
	}
}
discussions: {
	discussionId: {
		currentKey
		initAnchor
		initHead
		initKey
		selection: {
			a
			h
			type
		}
	}
}
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
		this.addClientCursor = this.addClientCursor.bind(this);
		this.updateClientCursor = this.updateClientCursor.bind(this);
		this.deleteClientCursor = this.deleteClientCursor.bind(this);
		this.issueEmptyTransaction = this.issueEmptyTransaction.bind(this);
		this.setResendTimeout = this.setResendTimeout.bind(this);

		this.updateDiscussion = this.updateDiscussion.bind(this);
		this.deleteDiscussion = this.deleteDiscussion.bind(this);
		this.syncDiscussions = this.syncDiscussions.bind(this);

		/* Init plugin variables */
		this.startedLoad = false;
		this.mostRecentRemoteKey = pluginProps.initialDocKey;
		this.cursors = {};
		this.discussions = {};
		this.ongoingTransaction = false;
		this.resendSyncTimeout = undefined;

		/* Setup Prosemirror plugin values */
		this.spec = {
			state: {
				init: () => {
					return { isLoaded: false };
				},
				apply: this.apply.bind(this),
			},
			view: (view) => {
				this.view = view;
				this.loadDocument();
				return {
					update: (newView) => {
						this.view = newView;
					},
				};
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

		// console.time('restoringdiscussions');
		// restoreDiscussionMaps(this.pluginProps.firebaseRef, this.view.state.schema).then(() => {
		// 	console.timeEnd('restoringdiscussions');
		// });

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

				// storeCheckpoint(this.pluginProps.firebaseRef, newDoc, this.mostRecentRemoteKey);
				const trans = receiveTransaction(this.view.state, steps, stepClientIds);
				this.view.dispatch(trans);

				/* Retrieve and Listen to Cursors */
				const cursorsRef = this.pluginProps.firebaseRef.child('cursors');
				cursorsRef
					.child(this.pluginProps.localClientId)
					.onDisconnect()
					.remove();
				cursorsRef.on('child_added', this.addClientCursor);
				cursorsRef.on('child_changed', this.updateClientCursor);
				cursorsRef.on('child_removed', this.deleteClientCursor);

				/* Retrieve and Listen to Discussions */
				const discussionsRef = this.pluginProps.firebaseRef.child('discussions');
				discussionsRef.on('child_added', this.updateDiscussion);
				discussionsRef.on('child_changed', this.updateDiscussion);
				discussionsRef.on('child_removed', this.deleteDiscussion);

				/* Set finishedLoading flag */
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

		return this.view.dispatch(trans);
	}

	sendCollabChanges(transaction, newState) {
		// TODO: Rather than exclude - we should probably explicitly list the types of transactions we accept.
		// Exluding only will break when others add custom plugin transactions.
		const meta = transaction.meta;
		if (
			meta.finishedLoading ||
			meta.collab$ ||
			meta.rebase ||
			meta.footnote ||
			meta.highlightsToRemove ||
			meta.newHighlightsData ||
			meta.appendedTransaction ||
			meta.localHighlights
		) {
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
						t: firebaseTimestamp,
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

						/* If multiple of saveEveryNSteps, update checkpoint */
						const saveEveryNSteps = 100;
						if (snapshot.key % saveEveryNSteps === 0) {
							storeCheckpoint(
								this.pluginProps.firebaseRef,
								newState.doc,
								snapshot.key,
							);
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
		/* Remove Stale Cursors */
		Object.keys(this.cursors).forEach((clientId) => {
			const originalClientData = this.cursors[clientId] || {};
			const expirationTime = 1000 * 60 * 5; /* 5 minutes */
			const lastActiveExpired =
				originalClientData.lastActive + expirationTime < new Date().getTime();
			if (!originalClientData.lastActive || lastActiveExpired) {
				this.pluginProps.firebaseRef
					.child('cursors')
					.child(clientId)
					.remove();
			}
		});

		if (transaction.docChanged) {
			/* Map Cursors */
			Object.keys(this.cursors)
				.filter((clientId) => {
					/* Don't map local client's cursor */
					return this.cursors[clientId] !== this.pluginProps.localClientId;
				})
				.forEach((clientId) => {
					this.cursors[clientId].selection = this.cursors[clientId].selection.map(
						editorState.doc,
						transaction.mapping,
					);
				});

			/* Map Discussions */
			Object.keys(this.discussions).forEach((discussionId) => {
				const prevSelection = this.discussions[discussionId].selection;
				this.discussions[discussionId].selection = prevSelection.map(
					editorState.doc,
					transaction.mapping,
				);
			});
		}

		if (transaction.meta.collab$) {
			this.syncDiscussions();
		}

		/* Set Cursor data */
		const prevCursor = this.cursors[this.pluginProps.localClientId] || {};
		const prevSelection = prevCursor.selection || {};
		const selection = editorState.selection || {};
		const needsToInit = !(prevSelection.a || prevSelection.anchor);
		const isPointer = transaction.meta.pointer;
		const isNotSelectAll = selection instanceof AllSelection === false;
		const isCursorChange =
			!transaction.docChanged &&
			(selection.anchor !== prevSelection.anchor || selection.head !== prevSelection.head);
		if (isNotSelectAll && (needsToInit || isPointer || isCursorChange)) {
			const anchorEqual = prevSelection.anchor === selection.anchor;
			const headEqual = prevSelection.head === selection.head;
			if (!prevSelection.anchor || !anchorEqual || !headEqual) {
				const newCursorData = {
					...this.pluginProps.localClientData,
					selection: selection,
				};

				/* lastActive has to be rounded to the nearest minute (or some larger value)
				If it is updated every millisecond, firebase will see it as constant changes and you'll get a 
				loop of updates triggering millisecond updates. The lastActive is updated anytime a client 
				makes or receives changes. A client will be active even if they have a tab open and are 'watching'. */
				const smoothingTimeFactor = 1000 * 60;
				newCursorData.lastActive =
					Math.round(new Date().getTime() / smoothingTimeFactor) * smoothingTimeFactor;

				this.cursors[this.pluginProps.localClientId] = newCursorData;
				const firebaseCursorData = {
					...newCursorData,
					selection: needsToInit
						? {
								a: 1,
								h: 1,
								t: 'text',
						  }
						: compressSelectionJSON(selection.toJSON()),
				};
				this.pluginProps.firebaseRef
					.child('cursors')
					.child(this.pluginProps.localClientId)
					.set(firebaseCursorData);
			}
		}

		/* Send Collab Changes */
		this.sendCollabChanges(transaction, editorState);

		if (transaction.meta.finishedLoading) {
			return { isLoaded: true };
		}
		return {
			...state,
			mostRecentRemoteKey: this.mostRecentRemoteKey,
		};
	}

	syncDiscussions() {
		Object.keys(this.discussions).forEach((discussionId) => {
			this.pluginProps.firebaseRef
				.child('discussions')
				.child(discussionId)
				.transaction(
					(existingDiscussionData) => {
						if (existingDiscussionData.currentKey >= this.mostRecentRemoteKey) {
							return undefined;
						}
						this.pluginProps.onStatusChange('saving');
						return {
							...existingDiscussionData,
							currentKey: this.mostRecentRemoteKey,
							selection: compressSelectionJSON(
								this.discussions[discussionId].selection.toJSON(),
							),
						};
					},
					() => {
						this.pluginProps.onStatusChange('saved');
					},
					false,
				)
				.catch((err) => {
					console.error('Discussions Sync Failed', err);
				});
		});
	}

	issueEmptyTransaction() {
		this.view.dispatch(this.view.state.tr);
	}

	updateClientCursor(snapshot) {
		/* Called on firebase updates to cursors */
		const clientID = snapshot.key;
		if (clientID !== this.pluginProps.localClientId) {
			const snapshotVal = snapshot.val();
			/* Invalid cursors can happen if a cursor is synced before the corresponding changes from that 
			remote editor. We simply remove the cursor in that case, and wait for the proper position to sync. */
			// const invalidSelection =
			// 	Math.max(snapshotVal.a, snapshotVal.h) > this.view.state.doc.content.size - 1;
			// if (snapshotVal && !invalidSelection) {
			try {
				/* This try-catch is a safegaurd against */
				/* cursors being a step out of sync and */
				/* referring to an impossible range in the */
				/* local doc */
				this.cursors[clientID] = {
					...snapshotVal,
					selection: Selection.fromJSON(
						this.view.state.doc,
						uncompressSelectionJSON(snapshotVal.selection),
					),
				};
			} catch (err) {
				delete this.cursors[clientID];
			}
			this.issueEmptyTransaction();
		}
	}

	addClientCursor(snapshot) {
		this.updateClientCursor(snapshot);
		this.pluginProps.onClientChange(
			Object.keys(this.cursors)
				.filter((key) => {
					return this.cursors[key];
				})
				.map((key) => {
					return this.cursors[key].data;
				}),
		);
	}

	deleteClientCursor(snapshot) {
		const clientID = snapshot.key;
		delete this.cursors[clientID];
		this.pluginProps.onClientChange(
			Object.keys(this.cursors)
				.filter((key) => {
					return this.cursors[key];
				})
				.map((key) => {
					return this.cursors[key].data;
				}),
		);
		this.issueEmptyTransaction();
	}

	updateDiscussion(snapshot) {
		/* New discussions and discussions that aren't tracked are treated as the same. */
		/* If you do track a disucssion, or have sendable steps, or the keys don't match, ignore the update */
		const discussionId = snapshot.key;
		const discussionData = snapshot.val() || {};
		const alreadyHandled = Object.keys(this.discussions).reduce((prev, curr) => {
			if (curr === discussionId) {
				return true;
			}
			return prev;
		}, false);

		if (
			discussionData.currentKey === this.mostRecentRemoteKey &&
			!sendableSteps(this.view.state) &&
			!alreadyHandled
		) {
			this.discussions[discussionId] = {
				...discussionData,
				selection: Selection.fromJSON(
					this.view.state.doc,
					uncompressSelectionJSON(discussionData.selection),
				),
			};
			this.issueEmptyTransaction();
		}
	}

	deleteDiscussion(snapshot) {
		const discussionId = snapshot.key;
		delete this.discussions[discussionId];
		this.issueEmptyTransaction();
	}

	decorations(state) {
		const cursorKeys = Object.keys(this.cursors);
		const discussionKeys = Object.keys(this.discussions);
		const decorations = [];
		cursorKeys.forEach((clientId) => {
			if (clientId === this.pluginProps.localClientId) {
				return null;
			}

			const cursor = this.cursors[clientId];
			if (!cursor) {
				return null;
			}

			// const data = selection.data || {};
			// if (!data.canEdit) {
			// 	return null;
			// }

			/* Classnames must begin with letter, so append one single uuid's may not. */
			// console.time('render');
			// const formattedDataId = `c-${cursor.id}`;
			// const CursorElem = () => (
			// 	<span className={`collab-cursor ${formattedDataId}`}>
			// 		<span className="inner-bar">OK</span>
			// 	</span>
			// );
			// const rootElem = document.createElement('span');
			// ReactDOM.render(<CursorElem />, rootElem);
			// console.timeEnd('render');
			// console.log(rootElem);

			/* Classnames must begin with letter, so append one single uuid's may not. */
			const formattedDataId = `c-${cursor.id}`;
			// console.time('redner2');
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
			if (cursor.initials) {
				const innerCircleInitials = document.createElement('span');
				innerCircleInitials.className = `initials ${formattedDataId}`;
				innerStyle += `.initials.${formattedDataId}::after { content: "${
					cursor.initials
				}"; } `;
				hoverItemsWrapper.appendChild(innerCircleInitials);
			}
			/* If Image exists - add to hover items wrapper */
			if (cursor.image) {
				const innerCircleImage = document.createElement('span');
				innerCircleImage.className = `image ${formattedDataId}`;
				innerStyle += `.image.${formattedDataId}::after { background-image: url('${
					cursor.image
				}'); } `;
				hoverItemsWrapper.appendChild(innerCircleImage);
			}

			/* If name exists - add to hover items wrapper */
			if (cursor.name) {
				const innerCircleName = document.createElement('span');
				innerCircleName.className = `name ${formattedDataId}`;
				innerStyle += `.name.${formattedDataId}::after { content: "${cursor.name}"; } `;
				if (cursor.cursorColor) {
					innerCircleName.style.backgroundColor = cursor.cursorColor;
				}
				hoverItemsWrapper.appendChild(innerCircleName);
			}

			/* If cursor color provided - override defaults */
			if (cursor.cursorColor) {
				innerChildBar.style.backgroundColor = cursor.cursorColor;
				innerChildCircleSmall.style.backgroundColor = cursor.cursorColor;
				innerChildCircleBig.style.backgroundColor = cursor.cursorColor;
				innerStyle += `.name.${formattedDataId}::after { background-color: ${
					cursor.cursorColor
				} !important; } `;
			}
			style.innerHTML = innerStyle;
			// console.timeEnd('redner2');
			const selectionFrom = cursor.selection.from;
			const selectionTo = cursor.selection.to;
			const selectionHead = cursor.selection.head;
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
						class: `cursor-range ${formattedDataId}`,
						style: `background-color: ${cursor.backgroundColor ||
							'rgba(0, 25, 150, 0.2)'};`,
					}),
				);
			}
			return null;
		});

		/* Add discussion decorations */
		discussionKeys.forEach((discussionId) => {
			const discussion = this.discussions[discussionId];
			if (discussion) {
				decorations.push(
					Decoration.inline(discussion.selection.from, discussion.selection.to, {
						class: `discussion-range d-${discussionId}`,
						style: `background-color: ${'rgba(50, 25, 50, 0.2)'};`,
					}),
				);

				const highlightTo = discussion.selection.to;
				const elem = document.createElement('span');
				elem.className = `discussion-mount dm-${discussionId}`;

				decorations.push(
					Decoration.widget(highlightTo, elem, {
						stopEvent: () => {
							return true;
						},
						key: `dm-${discussionId}`,
						marks: [],
					}),
				);
			}
		});

		return DecorationSet.create(
			state.doc,
			decorations.filter((dec) => {
				return !!dec;
			}),
		);
	}
}
