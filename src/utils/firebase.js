import { compressStateJSON } from 'prosemirror-compress-pubpub';

export const firebaseTimestamp = { '.sv': 'timestamp' };

export const storeCheckpoint = async (firebaseRef, docNode, keyNumber) => {
	const checkpoint = {
		d: compressStateJSON({ doc: docNode.toJSON() }).d,
		k: keyNumber,
		t: firebaseTimestamp,
	};
	await Promise.all([
		firebaseRef.child('checkpoint').set(checkpoint),
		firebaseRef.child(`checkpoints/${keyNumber}`).set(checkpoint),
		firebaseRef.child(`checkpointMap/${keyNumber}`).set(firebaseTimestamp),
	]);
};

export const flattenKeyables = (keyables) =>
	/* flattenedMergeStepArray is an array of { steps, client, time } values */
	/* It flattens the case where we have a merge-object which is an array of */
	/* { steps, client, time } values. */
	Object.keys(keyables).reduce((prev, curr) => {
		if (Array.isArray(keyables[curr])) {
			return [...prev, ...keyables[curr]];
		}
		return [...prev, keyables[curr]];
	}, []);
