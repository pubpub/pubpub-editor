import { Plugin, PluginKey } from 'prosemirror-state';
import { collab, receiveTransaction, sendableSteps } from 'prosemirror-collab';
import { Step } from 'prosemirror-transform';
import { Node } from 'prosemirror-model';
import { compressStepJSON, uncompressStepJSON } from 'prosemirror-compress-pubpub';
import uuidv4 from 'uuid/v4';
import { generateHash, storeCheckpoint, firebaseTimestamp } from '../utils';
import buildDiscussions from './discussions';
import buildCursors from './cursors';

export const collaborativePluginKey = new PluginKey('collaborative');
/*
Rough pipeline:
Client types changes
Client sets ongoingTransaction=true and writes a transation
if that transaction succeeds
	set ongoingTransaction=false
if that transaction fails because of error
	throw error
if that transaction fails beause there is already a keyable with that id
	process pending stored keyables

When a remote change is made and synced to client, store that keyable
Attempt to process all stored keyables
	don't process if there is an ongoing transaction

If there is an ongoing transaction, it will eventually finish and trigger a new receiveCollabChanges
	or, it will fail and that will cause processStoredKeyables to fire.
*/

const buildCollab = (schema, props, localClientId) => {
	let mostRecentRemoteKey = props.collaborativeOptions.initialDocKey;
	let ongoingTransaction = false;
	let pendingRemoteKeyables = [];
	const onStatusChange = props.collaborativeOptions.onStatusChange || function() {};
	const onUpdateLatestKey = props.collaborativeOptions.onUpdateLatestKey || function() {};

	/* sendCollabChanges is called only from the main Editor */
	/* disppatchTransaction view spec paramater. sendCollabChanges */
	/* is called on every transaction, but it quickly exits if the */
	/* transaction is not of the right type (meta), or if a firebase */
	/* transaction is already in progress. */

	/* If the firebase transaction commit fails because the keyable key */
	/* already exists, we either 1) have the transaction in pendingRemoteKeyables */
	/* or we are about to receive a new firebase child. Both cases will result in  */
	/* collab.receiveTransaction being called, which will dispatch a transaction */
	/* triggering sendCollabChanges to be called again, thus syncing our local */
	/* uncommitted steps. */
	const sendCollabChanges = (view, transaction, newState) => {
		const validMetaKeys = ['history$', 'paste', 'uiEvent'];
		const hasInvalidMetaKeys = Object.keys(transaction.meta).some((key) => {
			const keyIsValid = validMetaKeys.includes(key);
			return !keyIsValid;
		});

		const sendable = sendableSteps(newState);

		if (props.isReadOnly || ongoingTransaction || hasInvalidMetaKeys || !sendable) {
			return null;
		}
		ongoingTransaction = true;
		const steps = sendable.steps;
		const clientId = sendable.clientID;
		const branchId = props.collaborativeOptions.firebaseRef.key.replace('branch-', '');
		return props.collaborativeOptions.firebaseRef
			.child('changes')
			.child(mostRecentRemoteKey + 1)
			.transaction(
				(existingRemoteSteps) => {
					onStatusChange('saving');
					if (existingRemoteSteps) {
						/* Returning undefined causes firebase transaction to abort. */
						/* https://firebase.google.com/docs/reference/js/firebase.database.Reference#transactionupdate:-function */
						return undefined;
					}
					return {
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
				ongoingTransaction = false;
				if (committed) {
					onStatusChange('saved');

					/* If multiple of saveEveryNSteps, update checkpoint */
					const saveEveryNSteps = 100;
					if (snapshot.key && snapshot.key % saveEveryNSteps === 0) {
						storeCheckpoint(
							props.collaborativeOptions.firebaseRef,
							newState.doc,
							snapshot.key,
						);
					}
				}
				/* eslint-disable-next-line no-use-before-define */
				processStoredKeyables(view);
			})
			.catch((err) => {
				console.error('Error in firebase transaction:', err);
				props.onError(err);
			});
	};

	/* Iterate over pendingRemoteKeyables if there is no ongoing */
	/* firebase transaction. If there is an ongoing firebase transaction */
	/* it will either fail, causing this function to be called again, or it */
	/* will succeed, which will cause a new keyable child to sync, triggering */
	/* receiveCollabChanges, and thus this function. */
	const processStoredKeyables = (view) => {
		if (!ongoingTransaction) {
			pendingRemoteKeyables.forEach((snapshot) => {
				try {
					mostRecentRemoteKey = Number(snapshot.key);
					const snapshotVal = snapshot.val();
					const compressedStepsJSON = snapshotVal.s;
					const clientId = snapshotVal.cId;
					const newSteps = compressedStepsJSON.map((compressedStepJSON) => {
						return Step.fromJSON(schema, uncompressStepJSON(compressedStepJSON));
					});
					const newStepsClientIds = new Array(newSteps.length).fill(clientId);
					const trans = receiveTransaction(view.state, newSteps, newStepsClientIds);

					view.dispatch(trans);
					onUpdateLatestKey(mostRecentRemoteKey);
				} catch (err) {
					console.error('Error in recieveCollabChanges:', err);
					props.onError(err);
				}
			});
			pendingRemoteKeyables = [];
			if (sendableSteps(view.state)) {
				sendCollabChanges(view, view.state.tr, view.state);
			}
		}
	};

	/* This is called everytime firebase has a new keyable child */
	/* We store the new keyable in pendingRemoteKeyables, and then */
	/* process all existing stored keyables. */
	const receiveCollabChanges = (snapshot, view) => {
		pendingRemoteKeyables.push(snapshot);
		processStoredKeyables(view);
	};

	const loadDocument = (view) => {
		if (props.collaborativeOptions.delayLoadingDocument) {
			return null;
		}
		return props.collaborativeOptions.firebaseRef
			.child('changes')
			.orderByKey()
			.startAt(String(mostRecentRemoteKey + 1))
			.once('value')
			.then((changesSnapshot) => {
				const changesSnapshotVal = changesSnapshot.val() || {};
				const steps = [];
				const stepClientIds = [];
				const keys = Object.keys(changesSnapshotVal);
				mostRecentRemoteKey = keys.length
					? keys
							.map((key) => Number(key))
							.reduce((prev, curr) => {
								return curr > prev ? curr : prev;
							}, 0)
					: mostRecentRemoteKey;

				/* Uncompress steps and add stepClientIds */
				Object.keys(changesSnapshotVal).forEach((key) => {
					const compressedStepsJSON = changesSnapshotVal[key].s;
					const uncompressedSteps = compressedStepsJSON.map((compressedStepJSON) => {
						return Step.fromJSON(schema, uncompressStepJSON(compressedStepJSON));
					});
					steps.push(...uncompressedSteps);
					stepClientIds.push(
						...new Array(compressedStepsJSON.length).fill(changesSnapshotVal[key].c),
					);
				});

				/* Update the prosemirror view with new doc */
				const newState = view.state;
				newState.doc = Node.fromJSON(schema, props.initialContent);
				view.updateState(newState);

				onUpdateLatestKey(mostRecentRemoteKey);

				const trans = receiveTransaction(view.state, steps, stepClientIds);
				view.dispatch(trans);

				/* Set finishedLoading flag */
				const finishedLoadingTrans = view.state.tr;
				finishedLoadingTrans.setMeta('finishedLoading', true);
				view.dispatch(finishedLoadingTrans);

				/* Listen to Changes */
				return props.collaborativeOptions.firebaseRef
					.child('changes')
					.orderByKey()
					.startAt(String(mostRecentRemoteKey + 1))
					.on('child_added', (snapshot) => {
						receiveCollabChanges(snapshot, view);
					});
			})
			.catch((err) => {
				console.error('In loadDocument Error with ', err, err.message);
			});
	};

	return new Plugin({
		key: collaborativePluginKey,
		state: {
			init: () => {
				return {
					isLoaded: false,
					localClientId: localClientId,
					localClientData: props.collaborativeOptions.clientData,
					sendCollabChanges: sendCollabChanges,
				};
			},
			apply: (transaction, pluginState) => {
				return {
					isLoaded: transaction.meta.finishedLoading || pluginState.isLoaded,
					mostRecentRemoteKey: mostRecentRemoteKey,
					localClientId: localClientId,
					localClientData: props.collaborativeOptions.clientData,
					sendCollabChanges: sendCollabChanges,
				};
			},
		},
		view: (view) => {
			loadDocument(view);
			return {};
		},
	});
};

export default (schema, props) => {
	if (!props.collaborativeOptions.firebaseRef) {
		return [];
	}

	const localClientId = `${props.collaborativeOptions.clientData.id}-${generateHash(6)}`;

	return [
		collab({
			clientID: localClientId,
		}),
		buildCollab(schema, props, localClientId),
		buildDiscussions(schema, props, collaborativePluginKey),
		buildCursors(schema, props, collaborativePluginKey),
	];
};
