import { EditorState, Plugin, PluginKey } from 'prosemirror-state';
import { collab, receiveTransaction, sendableSteps } from 'prosemirror-collab';
import { Step } from 'prosemirror-transform';
import { Node } from 'prosemirror-model';
import { compressStepJSON, uncompressStepJSON } from 'prosemirror-compress-pubpub';
import uuidv4 from 'uuid/v4';
import { generateHash, storeCheckpoint, firebaseTimestamp } from '../utils';

/*
Client1 types changes
Client1 sets ongoingTransaction=true and writes a transation
if that transaction succeeds
	set ongoingTransaction=false
if that transaction fails because of error
	throw error
if that transaction fails beause there is already a keyable with that id
	process pending stored keyables

When a remote change is made and synced to client, store that keyable
Attempt to process all stored keyables
	don't process if there is an ongoing transaction (are we sure on the if here?)

If there is an ongoing transaction, it will eventually finish and trigger a new recievetransaction from remote
	or, it will fail and that will cause processstoredTransations to fire.


*/

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

export default (schema, props) => {
	const collabOptions = props.collaborativeOptions;
	if (!collabOptions.firebaseRef) {
		return [];
	}

	const localClientId = `${collabOptions.clientData.id}-${generateHash(6)}`;

	return [
		collab({
			clientID: localClientId,
		}),
		/* eslint-disable-next-line no-use-before-define */
		new CollaborativePlugin({
			firebaseRef: collabOptions.firebaseRef,
			delayLoadingDocument: collabOptions.delayLoadingDocument,
			isReadOnly: props.isReadOnly,
			initialContent: props.initialContent,
			onError: props.onError,
			initialDocKey: collabOptions.initialDocKey,
			localClientData: collabOptions.clientData,
			localClientId: localClientId,
			onStatusChange: collabOptions.onStatusChange || function() {},
			onUpdateLatestKey: collabOptions.onUpdateLatestKey || function() {},
		}),
	];
};

export const collaborativePluginKey = new PluginKey('collaborative');

class CollaborativePlugin extends Plugin {
	constructor(pluginProps) {
		super({ key: collaborativePluginKey });
		this.pluginProps = pluginProps;

		this.lastTime = Date.now();
		/* Bind plugin functions */
		this.loadDocument = this.loadDocument.bind(this);
		this.sendCollabChanges = this.sendCollabChanges.bind(this);
		this.receiveCollabChanges = this.receiveCollabChanges.bind(this);
		this.processStoredKeyables = this.processStoredKeyables.bind(this);

		/* Init plugin variables */
		this.startedLoad = false;
		this.mostRecentRemoteKey = pluginProps.initialDocKey;
		this.ongoingTransaction = false;
		this.pendingRemoteKeyables = [];

		/* Setup Prosemirror plugin values */
		this.spec = {
			state: {
				init: () => {
					return { isLoaded: false, sendCollabChanges: this.sendCollabChanges };
				},
				apply: (transaction, pluginState) => {
					return {
						isLoaded: transaction.meta.finishedLoading || pluginState.isLoaded,
						mostRecentRemoteKey: this.mostRecentRemoteKey,
					};
				},
			},
			view: (view) => {
				this.view = view;
				if (!this.startedLoad) {
					this.loadDocument();
				}

				return {
					update: (newView) => {
						this.view = newView;
					},
				};
			},
		};
	}

	loadDocument() {
		// if (this.startedLoad) {
		// 	return null;
		// }
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
					? keys
							.map((key) => Number(key))
							.reduce((prev, curr) => {
								return curr > prev ? curr : prev;
							}, 0)
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

				this.pluginProps.onUpdateLatestKey(this.mostRecentRemoteKey);

				const trans = receiveTransaction(this.view.state, steps, stepClientIds);
				this.view.dispatch(trans);

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

	/* This is called everytime firebase has a new keyable child */
	/* We store the new keyable in pendingRemoteKeyables, and then */
	/* process all existing stored keyables. */
	receiveCollabChanges(snapshot) {
		// console.log('In receive');
		this.pendingRemoteKeyables.push(snapshot);
		this.processStoredKeyables();
	}

	/* sendCollabChanges is called only from the main */
	/* Editor disppatchTransaction spec paramater. sendCollabChanges */
	/* is called on every transaction, but it quickly exits if the */
	/* transaction is not of the right type (meta), or if a firebase */
	/* transaction is already in progress. */

	/* If the firebase transaction commit fails because the keyable key */
	/* already exists, we either 1) have the transaction in pendingRemoteKeyables */
	/* or we are about to receive a new firebase child. Both cases will result in  */
	/* collab.receiveTransaction being called, which will dispatch a transaction */
	/* triggering sendCollabChanges to be called again, thus syncing our local */
	/* uncommitted steps. */
	sendCollabChanges(transaction, newState) {
		const validMetaKeys = ['history$', 'paste', 'uiEvent'];
		const hasInvalidMetaKeys = Object.keys(transaction.meta).some((key) => {
			const keyIsValid = validMetaKeys.includes(key);
			return !keyIsValid;
		});

		const sendable = sendableSteps(newState);

		if (
			this.pluginProps.isReadOnly ||
			this.ongoingTransaction ||
			hasInvalidMetaKeys ||
			!sendable
		) {
			// console.log('ongoing, sendable', this.ongoingTransaction, sendable);
			return null;
		}
		this.ongoingTransaction = true;
		const steps = sendable.steps;
		const clientId = sendable.clientID;
		const branchId = this.pluginProps.firebaseRef.key.replace('branch-', '');
		const thisTime = Date.now();
		console.log('Time in between', thisTime - this.lastTime);
		this.lastTime = thisTime;
		return this.pluginProps.firebaseRef
			.child('changes')
			.child(this.mostRecentRemoteKey + 1)
			.transaction(
				(existingRemoteSteps) => {
					this.pluginProps.onStatusChange('saving');
					return existingRemoteSteps
						? undefined
						: {
								id: uuidv4(), // Keyable Id
								cId: clientId, // Client Id
								bId: branchId, // Origin Branch Id
								s: steps.map((step) => compressStepJSON(step.toJSON())),
								t: firebaseTimestamp,
						  };
				},
				null,
				false,
			)
			.then((transactionResult) => {
				const { committed, snapshot } = transactionResult;
				// console.log('finished trans with', committed);
				this.ongoingTransaction = false;
				if (committed) {
					this.pluginProps.onStatusChange('saved');

					/* If multiple of saveEveryNSteps, update checkpoint */
					const saveEveryNSteps = 100;
					if (snapshot.key && snapshot.key % saveEveryNSteps === 0) {
						storeCheckpoint(this.pluginProps.firebaseRef, newState.doc, snapshot.key);
					}
				}
				//  else {
				// 	this.processStoredKeyables();
				// }
				// console.log(sendableSteps(this.view.state));
				this.processStoredKeyables();
			})
			.catch((err) => {
				console.error('Error in firebase transaction:', err);
				this.pluginProps.onError(err);
			});
	}

	processStoredKeyables() {
		/* Iterate over pendingRemoteKeyables if there is no ongoing */
		/* firebase transaction. If there is an ongoing firebase transaction */
		/* it will either fail, causing this function to be called again, or it */
		/* will succeed, which will cause a new keyable child to sync, triggering */
		/* receiveCollabChanges, and thus this function. */
		// console.log('in process stored');
		if (!this.ongoingTransaction) {
			// console.log('past ongoing');
			this.pendingRemoteKeyables.forEach((snapshot) => {
				try {
					this.mostRecentRemoteKey = Number(snapshot.key);
					const snapshotVal = snapshot.val();
					const compressedStepsJSON = snapshotVal.s;
					const clientId = snapshotVal.cId;
					const newSteps = compressedStepsJSON.map((compressedStepJSON) => {
						return Step.fromJSON(
							this.view.state.schema,
							uncompressStepJSON(compressedStepJSON),
						);
					});
					const newStepsClientIds = new Array(newSteps.length).fill(clientId);
					const trans = receiveTransaction(this.view.state, newSteps, newStepsClientIds);

					this.view.dispatch(trans);
					this.pluginProps.onUpdateLatestKey(this.mostRecentRemoteKey);
				} catch (err) {
					console.error('Error in recieveCollabChanges:', err);
					this.pluginProps.onError(err);
				}
			});
			this.pendingRemoteKeyables = [];
			if (sendableSteps(this.view.state)) {
				// console.log('have steps to send!');
				this.sendCollabChanges(this.view.state.tr, this.view.state);
				// const emptyInitTransaction = this.view.state.tr;
   	// 			this.view.dispatch(emptyInitTransaction);
			}
		}
	}
}
