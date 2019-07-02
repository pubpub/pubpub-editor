import React from 'react';
import { Selection } from 'prosemirror-state';
import { DOMParser, Schema, Slice, Node } from 'prosemirror-model';
import {
	compressSelectionJSON,
	uncompressSelectionJSON,
	uncompressStateJSON,
	uncompressStepJSON,
	compressStateJSON,
} from 'prosemirror-compress-pubpub';
import { Step, Mapping } from 'prosemirror-transform';
import { defaultNodes, defaultMarks } from './schemas';

export const firebaseTimestamp = { '.sv': 'timestamp' };

export const docIsEmpty = (doc) => {
	return (
		doc.childCount === 0 ||
		(doc.childCount === 1 && doc.firstChild.isTextblock && doc.firstChild.content.size === 0)
	);
};

export const dispatchEmptyTransaction = (editorView) => {
	const emptyInitTransaction = editorView.state.tr;
	editorView.dispatch(emptyInitTransaction);
};

export const buildSchema = (customNodes = {}, customMarks = {}) => {
	const schemaNodes = {
		...defaultNodes,
		...customNodes,
	};
	const schemaMarks = {
		...defaultMarks,
		...customMarks,
	};

	/* Filter out undefined (e.g. overwritten) nodes and marks */
	Object.keys(schemaNodes).forEach((nodeKey) => {
		if (!schemaNodes[nodeKey]) {
			delete schemaNodes[nodeKey];
		}
	});
	Object.keys(schemaMarks).forEach((markKey) => {
		if (!schemaMarks[markKey]) {
			delete schemaMarks[markKey];
		}
	});

	return new Schema({
		nodes: schemaNodes,
		marks: schemaMarks,
		topNode: 'doc',
	});
};

const renderReactFromSpec = (elem, key, holeContent) => {
	if (!elem) {
		return null;
	}
	if (typeof elem === 'string') {
		return elem;
	}
	if (elem.nodeType || elem.$$typeof) {
		return elem;
	}

	let attrs;
	let children;
	const hasAttrs =
		elem[1] && typeof elem[1] === 'object' && !elem[1].nodeType && !Array.isArray(elem[1]);
	if (hasAttrs) {
		attrs = elem[1];
	} else {
		attrs = {};
	}

	if (elem[2] === 0) {
		children = holeContent;
	} else if (typeof elem[2] === 'string') {
		children = elem[2];
	} else {
		const start = attrs ? 2 : 1;
		const childArray = elem.slice(start, elem.length);
		if (childArray.length) {
			children = childArray.map((child) => {
				return renderReactFromSpec(child);
			});
		}
	}
	return React.createElement(elem[0], { ...attrs, key: key }, children);
};

export const renderStatic = (schema = buildSchema(), nodeArray, editorProps) => {
	return nodeArray.map((node, index) => {
		let children;
		if (node.content) {
			children = renderStatic(schema, node.content, editorProps);
		}
		if (node.type === 'text') {
			const marks = node.marks || [];
			children = marks.reduce((prev, curr, markIndex) => {
				const currIndex = `${index}-${markIndex}`;
				const MarkComponent = schema.marks[curr.type].spec;
				return renderReactFromSpec(MarkComponent.toDOM(curr), currIndex);
				// .toStatic(curr, prev, currIndex);
				// return MarkComponent;
			}, node.text);
		}

		// const nodeWithIndex = node;
		// nodeWithIndex.currIndex = index;
		// const nodeOptions = editorProps.nodeOptions || {};
		// const customOptions = nodeOptions[node.type] || {};
		// const mergedOptions = { ...schema.nodes[node.type].spec.defaultOptions, ...customOptions };
		// const NodeComponent = schema.nodes[node.type].spec.toStatic(
		// 	nodeWithIndex,
		// 	mergedOptions,
		// 	false,
		// 	false,
		// 	{ ...editorProps, renderStaticMarkup: true },
		// 	children,
		// );
		// return NodeComponent;

		const NodeComponent = schema.nodes[node.type].spec;

		const output = renderReactFromSpec(
			NodeComponent.toDOM({ ...node, attrs: { ...node.attrs, key: index } }),
			index,
			children,
		);
		console.log(node, NodeComponent, children, output);
		return output;
	});
};

export const getJSON = (editorView) => {
	if (!editorView) {
		return null;
	}
	return editorView.state.doc.toJSON();
};

export const getText = (editorView, separator = '\n') => {
	if (!editorView) {
		return null;
	}
	return editorView.state.doc.textBetween(0, editorView.state.doc.nodeSize - 2, separator);
};

export const getCollabJSONs = (editorView, collabIds) => {
	const collabPlugin = editorView.state.plugins.reduce((prev, curr) => {
		if (curr.key === 'collaborative$') {
			return curr;
		}
		return prev;
	}, undefined);

	return collabPlugin ? collabPlugin.getJSONs(collabIds) : null;
};

export const importHtml = (editorView, htmlString) => {
	/* Create wrapper DOM node */
	const wrapperElem = document.createElement('div');

	/* Insert htmlString into wrapperElem to generate full DOM tree */
	wrapperElem.innerHTML = htmlString;

	/* Generate new ProseMirror doc from DOM node */
	const newDoc = DOMParser.fromSchema(editorView.state.schema).parse(wrapperElem);

	/* Create transaction and set selection to the beginning of the doc */
	const tr = editorView.state.tr;
	tr.setSelection(Selection.atStart(editorView.state.doc));
	tr.replaceSelection(new Slice(newDoc.content, 0, 0));

	/* Dispatch transaction to setSelection and insert content */
	editorView.dispatch(tr);
};

export const focus = (editorView) => {
	editorView.focus();
};

export const marksAtSelection = (editorView) => {
	return editorView.state.selection.$from.marks().map((mark) => {
		return mark.type.name;
	});
};

const flattenMergeStepArray = (keyables) =>
	/* flattenedMergeStepArray is an array of { steps, client, time } values */
	/* It flattens the case where we have a merge-object which is an array of */
	/* { steps, client, time } values. */
	Object.keys(keyables).reduce((prev, curr) => {
		if (Array.isArray(keyables[curr])) {
			return [...prev, ...keyables[curr]];
		}
		return [...prev, keyables[curr]];
	}, []);

export const createBranch = (baseFirebaseRef, newFirebaseRef, versionNumber) => {
	const getChanges = baseFirebaseRef
		.child('changes')
		.orderByKey()
		.startAt(String(0))
		.endAt(String(versionNumber))
		.once('value');
	const getMerges = baseFirebaseRef
		.child('merges')
		.orderByKey()
		.startAt(String(0))
		.endAt(String(versionNumber))
		.once('value');
	return Promise.all([getChanges, getMerges]).then(([changesSnapshot, mergesSnapshot]) => {
		const changesSnapshotVal = changesSnapshot.val() || {};
		const mergesSnapshotVal = mergesSnapshot.val() || {};
		const allKeyables = { ...changesSnapshotVal, ...mergesSnapshotVal };
		const flattenedMergeStepArray = flattenMergeStepArray(allKeyables);
		return newFirebaseRef.set({
			lastMergeKey: 0,
			merges: { 0: flattenedMergeStepArray },
		});
	});
};

export const mergeBranch = (sourceFirebaseRef, destinationFirebaseRef) => {
	/* TODO-BRANCH At the moment, this merge simply appends new changes in a merge */
	/* It does not properly handle 'commonAncestor' or any similar */
	/* concept which would be needed for multi-direction merging */
	/* or multi-branch merge trees */
	return destinationFirebaseRef
		.child('merges')
		.orderByKey()
		.startAt(String(0))
		.once('value')
		.then((mergesSnapshot) => {
			const mergesSnapshotVal = mergesSnapshot.val() || {};
			const numKeyables = Object.values(mergesSnapshotVal).reduce((prev, curr) => {
				return prev + curr.length;
			}, 0);
			const nextMergeKey = Object.values(mergesSnapshotVal).length;
			const getSourceChanges = sourceFirebaseRef
				.child('changes')
				.orderByKey()
				.startAt(String(numKeyables))
				.once('value');
			return Promise.all([getSourceChanges, nextMergeKey]);
		})
		.then(([changesSnapshot, nextMergeKey]) => {
			const changesSnapshotVal = changesSnapshot.val() || {};
			if (!Object.values(changesSnapshotVal).length) {
				/* If there are no new changes to add into a merge, simply return */
				return null;
			}
			const setLastMergeKey = destinationFirebaseRef.child('lastMergeKey').set(nextMergeKey);
			const appendMerge = destinationFirebaseRef
				.child('merges')
				.child(nextMergeKey)
				.set(Object.values(changesSnapshotVal));
			return Promise.all([setLastMergeKey, appendMerge]);
		});
};

export const getFirebaseDoc = (firebaseRef, schema, versionNumber) => {
	let mostRecentRemoteKey;
	return firebaseRef
		.child('checkpoint')
		.once('value')
		.then((checkpointSnapshot) => {
			const emptyDoc = { type: 'doc', attrs: { meta: {} }, content: [{ type: 'paragraph' }] };
			const checkpointSnapshotVal = checkpointSnapshot.val();

			const versionLessThanCheckpoint =
				versionNumber &&
				checkpointSnapshotVal &&
				versionNumber < Number(checkpointSnapshotVal.k);
			const useCheckpoint = checkpointSnapshotVal && !versionLessThanCheckpoint;
			/* If the given versionNumber is earlier than the checkpoint, build doc from 0 */
			// if (versionNumber && versionNumber < Number(checkpointSnapshotVal.k)) {
			// 	checkpointSnapshotVal.k = '-1';
			// 	checkpointSnapshotVal.d = emptyDoc;
			// }

			mostRecentRemoteKey = useCheckpoint ? Number(checkpointSnapshotVal.k) : -1;
			const docJSON = useCheckpoint
				? uncompressStateJSON(checkpointSnapshotVal).doc
				: emptyDoc;

			const newDoc = Node.fromJSON(schema, docJSON);

			/* Get all changes since mostRecentRemoteKey */
			const getChanges = firebaseRef
				.child('changes')
				.orderByKey()
				.startAt(String(mostRecentRemoteKey + 1))
				.endAt(String(versionNumber))
				.once('value');
			const getMerges = firebaseRef
				.child('merges')
				.orderByKey()
				.startAt(String(mostRecentRemoteKey + 1))
				.endAt(String(versionNumber))
				.once('value');
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

			return Promise.all([newDoc, getChanges, getMerges, getLatestChange, getLatestMerge]);
		})
		.then(([newDoc, changesSnapshot, mergesSnapshot, latestChange, latestMerge]) => {
			const changesSnapshotVal = changesSnapshot.val() || {};
			const mergesSnapshotVal = mergesSnapshot.val() || {};
			const allKeyables = { ...changesSnapshotVal, ...mergesSnapshotVal };
			const steps = [];
			const stepClientIds = [];
			const keys = Object.keys(allKeyables);
			mostRecentRemoteKey = keys.length ? Math.max(...keys) : mostRecentRemoteKey;

			const latestUpdates = {
				...latestChange.val(),
				...latestMerge.val(),
			};
			const latestKey = Object.keys(latestUpdates)
				.map((key) => parseInt(key, 10))
				.reduce((max, next) => Math.max(max, next), 0);

			const latestUpdateWrapped = latestUpdates[latestKey];
			const latestUpdate = Array.isArray(latestUpdateWrapped)
				? latestUpdateWrapped[latestUpdateWrapped.length - 1]
				: latestUpdateWrapped;

			const latestTimestamp = latestUpdate && latestUpdate.t;

			const flattenedMergeStepArray = flattenMergeStepArray(allKeyables);

			const currentTimestamp =
				flattenedMergeStepArray.length > 0
					? flattenedMergeStepArray[flattenedMergeStepArray.length - 1].t
					: null;

			/* Uncompress steps and add stepClientIds */
			flattenedMergeStepArray.forEach((stepContent) => {
				const compressedStepsJSON = stepContent.s;
				const uncompressedSteps = compressedStepsJSON.map((compressedStepJSON) => {
					return Step.fromJSON(schema, uncompressStepJSON(compressedStepJSON));
				});
				steps.push(...uncompressedSteps);
				stepClientIds.push(...new Array(compressedStepsJSON.length).fill(stepContent.c));
			});
			/* Uncompress steps and add stepClientIds */
			// Object.keys(changesSnapshotVal).forEach((key) => {
			// 	console.log('isArray', Array.isArray(changesSnapshotVal[key]));
			// 	const compressedStepsJSON = changesSnapshotVal[key].s;
			// 	const uncompressedSteps = compressedStepsJSON.map((compressedStepJSON) => {
			// 		return Step.fromJSON(schema, uncompressStepJSON(compressedStepJSON));
			// 	});
			// 	steps.push(...uncompressedSteps);
			// 	stepClientIds.push(
			// 		...new Array(compressedStepsJSON.length).fill(changesSnapshotVal[key].c),
			// 	);
			// });
			const updatedDoc = steps.reduce((prev, curr) => {
				const stepResult = curr.apply(prev);
				if (stepResult.failed) {
					console.error('Failed with ', stepResult.failed);
				}
				return stepResult.doc;
			}, newDoc);
			const currentKey = Number(versionNumber || latestKey);
			return {
				content: updatedDoc.toJSON(),
				mostRecentRemoteKey: mostRecentRemoteKey,
				historyData: {
					timestamps: {
						[currentKey]: currentTimestamp,
						[latestKey]: latestTimestamp,
					},
					currentKey: currentKey,
					latestKey: latestKey,
				},
			};
		})
		.catch((firebaseErr) => {
			console.error('firebaseErr', firebaseErr);
		});
};

export const generateHash = (length) => {
	const tokenLength = length || 32;
	const possible = 'abcdefghijklmnopqrstuvwxyz0123456789';

	let hash = '';
	for (let index = 0; index < tokenLength; index += 1) {
		hash += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return hash;
};

export const restoreDiscussionMaps = (firebaseRef, schema, useMergeSteps) => {
	/* This function looks at all the discussions and ensures */
	/* they have been mapped through all necessary steps */

	/* Get all discussions and find the oldest currentKey we */
	/* must map from */
	return firebaseRef
		.child('discussions')
		.once('value')
		.then((discussionsSnapshot) => {
			if (!discussionsSnapshot.val()) {
				throw new Error('No Discussions to map');
			}
			const discussions = discussionsSnapshot.val();
			const discussionsWithoutSelections = {};
			Object.keys(discussions).forEach((discussionKey) => {
				if (!discussions[discussionKey].initAnchor) {
					discussionsWithoutSelections[discussionKey] = discussions[discussionKey];
					delete discussions[discussionKey];
				}
			});
			const earliestKey = Object.values(discussions).reduce((prev, curr) => {
				if (Number(curr.currentKey) < prev) {
					return curr.currentKey;
				}
				return prev;
			}, Infinity);
			return [discussions, discussionsWithoutSelections, earliestKey];
		})
		.then(([discussions, discussionsWithoutSelections, earliestKey]) => {
			const getNewSteps = firebaseRef
				.child('changes')
				.orderByKey()
				.startAt(String(earliestKey + 1))
				.once('value');
			const getNewMerges = useMergeSteps
				? firebaseRef
						.child('merges')
						.orderByKey()
						.startAt(String(earliestKey + 1))
						.once('value')
				: { val: () => ({}) };
			const getStarterContent = getFirebaseDoc(firebaseRef, schema, earliestKey);
			return Promise.all([
				discussions,
				discussionsWithoutSelections,
				earliestKey,
				getNewSteps,
				getNewMerges,
				getStarterContent,
			]);
		})
		.then(
			([
				discussions,
				discussionsWithoutSelections,
				earliestKey,
				newStepsSnapshot,
				newMergesSnapshot,
				starterContent,
			]) => {
				const allChanges = {
					...newStepsSnapshot.val(),
					...newMergesSnapshot.val(),
				};
				/* Check if we are missing any keys - which can happen if steps */
				/* across a merge are needed, and we're calling from without */
				/* userMergeSteps (i.e. we're calling from clientside) */
				const isMissingKeys = Object.keys(allChanges)
					.sort()
					.reduce((prev, curr, index, array) => {
						const isLastElement = index === array.length - 1;
						const nextElement = array[index + 1];
						if (!isLastElement && Number(curr) + 1 !== Number(nextElement)) {
							return true;
						}
						return prev;
					}, false);
				if (!Object.keys(allChanges).length) {
					// console.log('Hey - nothing to do!');
					return null;
				}
				if (isMissingKeys) {
					console.error('Keys are missing so we cannot restore discussion maps.');
					return null;
				}
				const newDiscussions = {};
				let currentDoc = Node.fromJSON(schema, starterContent.content);
				let currentKey = earliestKey;

				Object.keys(discussions).forEach((discussionId) => {
					if (discussions[discussionId].currentKey === currentKey) {
						newDiscussions[discussionId] = {
							...discussions[discussionId],
							selection: Selection.fromJSON(
								currentDoc,
								uncompressSelectionJSON(discussions[discussionId].selection),
							),
						};
					}
				});

				Object.keys(allChanges).forEach((changeKey) => {
					currentKey = changeKey;
					const changeVal = allChanges[changeKey];
					const uncompressedChangeArray = Array.isArray(changeVal)
						? changeVal
						: [changeVal];

					/* Extract steps at current changeKey */
					const currentSteps = [];
					uncompressedChangeArray.forEach((stepContent) => {
						const compressedStepsJSON = stepContent.s;
						const uncompressedSteps = compressedStepsJSON.map((compressedStepJSON) => {
							return Step.fromJSON(schema, uncompressStepJSON(compressedStepJSON));
						});
						currentSteps.push(...uncompressedSteps);
					});

					/* Update currentDoc with steps at current changeKey */
					const nextDoc = currentSteps.reduce((prev, curr) => {
						const stepResult = curr.apply(prev);
						if (stepResult.failed) {
							console.error('Failed with ', stepResult.failed);
						}
						return stepResult.doc;
					}, currentDoc);

					currentDoc = nextDoc;

					/* Map all discussions in newDiscussions */
					const currentStepMaps = currentSteps.map((step) => {
						return step.getMap();
					});
					const currentMapping = new Mapping(currentStepMaps);

					Object.keys(newDiscussions).forEach((discussionId) => {
						const prevSelection = newDiscussions[discussionId].selection;
						newDiscussions[discussionId].selection = prevSelection.map(
							currentDoc,
							currentMapping,
						);
					});

					/* Init discussions that were made at this currentDoc */
					Object.keys(discussions).forEach((discussionId) => {
						if (discussions[discussionId].currentKey === Number(currentKey)) {
							newDiscussions[discussionId] = {
								...discussions[discussionId],
								selection: Selection.fromJSON(
									currentDoc,
									uncompressSelectionJSON(discussions[discussionId].selection),
								),
							};
						}
					});
				});
				const restoredDiscussions = { ...discussionsWithoutSelections };
				Object.keys(newDiscussions).forEach((discussionId) => {
					const newDiscussion = newDiscussions[discussionId];
					restoredDiscussions[discussionId] = {
						...newDiscussion,
						currentKey: Number(currentKey),
						selection: compressSelectionJSON(newDiscussion.selection.toJSON()),
					};
				});
				return firebaseRef.child('discussions').set(restoredDiscussions);
			},
		)
		.catch((err) => {
			if (err.message === 'No Discussions to map') {
				return null;
			}
			console.error(err);
		});
};

export const storeCheckpoint = (firebaseRef, docNode, keyNumber) => {
	return firebaseRef.child('checkpoint').set({
		d: compressStateJSON({ doc: docNode.toJSON() }).d,
		k: keyNumber,
		t: firebaseTimestamp,
	});
};

export const formatDiscussionData = (editorView, from, to) => {
	const collabPlugin = editorView.state.collaborative$ || {};
	const remoteKey = collabPlugin.mostRecentRemoteKey;
	return {
		currentKey: remoteKey,
		initAnchor: from,
		initHead: to,
		initKey: remoteKey,
		selection: {
			a: from,
			h: to,
			type: 'text',
		},
	};
};

export const setLocalHighlight = (editorView, from, to, id) => {
	const transaction = editorView.state.tr;
	transaction.setMeta('localHighlights', true);
	transaction.setMeta('newLocalHighlightData', [
		{
			from: from,
			to: to,
			id: id,
		},
	]);
	editorView.dispatch(transaction);
};

export const removeLocalHighlight = (editorView, id) => {
	const transaction = editorView.state.tr;
	transaction.setMeta('localHighlights', true);
	transaction.setMeta('localHighlightIdToRemove', id);
	editorView.dispatch(transaction);
};

export const convertLocalHighlightToDiscussion = (editorView, id, firebaseRef) => {
	const localHighlight = editorView.state.localHighlights$.activeDecorationSet
		.find()
		.filter((decoration) => {
			return decoration.type.attrs && decoration.type.attrs.class;
		})
		.reduce((prev, curr) => {
			const decorationId = curr.type.attrs.class.replace('local-highlight lh-', '');
			if (decorationId === id) {
				return curr;
			}
			return prev;
		}, {});
	const newDiscussionData = formatDiscussionData(
		editorView,
		localHighlight.from,
		localHighlight.to,
	);
	firebaseRef
		.child('discussions')
		.child(id)
		.set(newDiscussionData);
	removeLocalHighlight(editorView, id);
};
