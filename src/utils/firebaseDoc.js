import { Node } from 'prosemirror-model';
import { Step } from 'prosemirror-transform';
import { uncompressStateJSON, uncompressStepJSON } from 'prosemirror-compress-pubpub';

import { getEmptyDoc } from './doc';
import { flattenKeyables, storeCheckpoint } from './firebase';

const getMostRecentDocJson = async (firebaseRef, versionNumber = null) => {
	const hasVersionNumber = versionNumber || versionNumber === 0;
	// First see whether we have a checkpointMap -- this should indicate that there is one
	// or more checkpoint available in the `checkpoints` child.
	const checkpointMapSnapshot = await firebaseRef.child('checkpointMap').once('value');
	const checkpointMap = checkpointMapSnapshot.val();
	if (checkpointMap) {
		// We're interested in the keys of this object, which are strings. Cast them to numbers.
		const checkpointKeys = Object.keys(checkpointMap).map((key) => parseInt(key, 10));
		// Find the highest key less than or equal to versionNumber, and get that doc.
		// If there's no version number, we take the highest key.
		const bestKey = checkpointKeys
			.filter((key) => !hasVersionNumber || key <= versionNumber)
			.reduce((a, b) => Math.max(a, b), -1);
		if (bestKey >= 0) {
			const checkpointSnapshot = await firebaseRef
				.child(`checkpoints/${bestKey}`)
				.once('value');
			const checkpoint = checkpointSnapshot.val();
			if (checkpoint) {
				const { doc } = uncompressStateJSON(checkpoint);
				return { doc: doc, key: bestKey };
			}
		}
	}
	// Okay, no luck with the checkpointMap. Maybe there is something in the `checkpoint` key?
	// We are deprecating this (Ian, 03/2020) and ought to remove it shortly after.
	const checkpointSnapshot = await firebaseRef.child('checkpoint').once('value');
	const checkpoint = checkpointSnapshot.val();
	if (checkpoint) {
		const { k: keyString } = checkpoint;
		const { doc } = uncompressStateJSON(checkpoint);
		return { doc: doc, key: parseInt(keyString, 10) };
	}
	// There's no checkpoint, so let's just return an empty doc.
	return {
		doc: getEmptyDoc(),
		key: -1,
	};
};

export const getFirstKeyAndTimestamp = async (firebaseRef) => {
	const firstChangeSnapshot = await firebaseRef
		.child('changes')
		.orderByKey()
		.limitToFirst(1)
		.once('value');

	const firstChange = firstChangeSnapshot.val();
	if (firstChange) {
		const [key] = Object.keys(firstChange);
		const change = firstChange[key];
		const timestamp = change && change.t;
		if (change) {
			return { key: key, timestamp: timestamp };
		}
	}

	return null;
};

export const getLatestKeyAndTimestamp = async (firebaseRef) => {
	const getLatestChange = firebaseRef
		.child('changes')
		.orderByKey()
		.limitToLast(1)
		.once('value');

	const getLatestMerge = firebaseRef
		.child('merges')
		.orderByKey()
		.limitToLast(1)
		.once('value');

	const [latestChangeSnaphot, latestMergeSnapshot] = await Promise.all([
		getLatestChange,
		getLatestMerge,
	]);

	const latestUpdates = {
		...latestChangeSnaphot.val(),
		...latestMergeSnapshot.val(),
	};

	const latestKey = Object.keys(latestUpdates)
		.map((key) => parseInt(key, 10))
		.reduce((max, next) => Math.max(max, next), 0);

	const latestUpdateWrapped = latestUpdates[latestKey];
	const latestUpdate = Array.isArray(latestUpdateWrapped)
		? latestUpdateWrapped[latestUpdateWrapped.length - 1]
		: latestUpdateWrapped;
	const latestTimestamp = latestUpdate && latestUpdate.t;

	return { latestKey: latestKey, latestTimestamp: latestTimestamp };
};

const getStepsJsonFromChanges = (changes) => {
	return changes
		.map((change) => {
			const { s: compressedStepsJson } = change.s;
			return compressedStepsJson.map(uncompressStepJSON);
		})
		.reduce((a, b) => [...a, ...b], []);
};

export const getFirebaseDoc = async (
	firebaseRef,
	prosemirrorSchema,
	versionNumber = null,
	updateOutdatedCheckpoint = false,
) => {
	const { doc: checkpointDocJson, key: checkpointKey } = await getMostRecentDocJson(
		firebaseRef,
		versionNumber,
	);

	const getChanges = firebaseRef
		.child('changes')
		.orderByKey()
		.startAt(String(checkpointKey + 1))
		.endAt(String(versionNumber))
		.once('value');

	const getMerges = firebaseRef
		.child('merges')
		.orderByKey()
		.startAt(String(checkpointKey + 1))
		.endAt(String(versionNumber))
		.once('value');

	const [changesSnapshot, mergesSnapshot] = await Promise.all([getChanges, getMerges]);

	const allKeyables = {
		...changesSnapshot.val(),
		...mergesSnapshot.val(),
	};

	const flattenedChanges = flattenKeyables(allKeyables);
	const stepsJson = getStepsJsonFromChanges(flattenedChanges);

	const keys = Object.keys(allKeyables);
	const currentKey = keys.length ? Math.max(...keys) : checkpointKey;

	const currentTimestamp =
		flattenedChanges.length > 0 ? flattenedChanges[flattenedChanges.length - 1].t : null;

	const currentDoc = stepsJson.reduce((intermediateDoc, stepJson) => {
		const step = Step.fromJSON(prosemirrorSchema, stepJson);
		const { failed, doc } = step.apply(intermediateDoc);
		if (failed) {
			console.error(`Failed with: {failed}`);
		}
		return doc;
	}, Node.fromJSON(prosemirrorSchema, checkpointDocJson));

	// TODO(ian): Feels like we should not be doing this as a side effect.
	const isCheckpointOutdated = !!stepsJson.length;
	if (isCheckpointOutdated && !versionNumber && updateOutdatedCheckpoint) {
		storeCheckpoint(firebaseRef, currentDoc, currentKey);
	}

	return {
		doc: currentDoc.toJSON(),
		key: currentKey,
		timestamp: currentTimestamp,
	};
};
