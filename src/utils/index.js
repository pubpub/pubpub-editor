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
import css from 'css';
import camelCaseCss from 'camelcase-css';

import { defaultNodes, defaultMarks } from '../schemas';

export const firebaseTimestamp = { '.sv': 'timestamp' };

export const getEmptyDoc = () => {
	return { type: 'doc', attrs: { meta: {} }, content: [{ type: 'paragraph' }] };
};

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

export const buildSchema = (customNodes = {}, customMarks = {}, nodeOptions = {}) => {
	const schemaNodes = {
		...defaultNodes,
		...customNodes,
	};
	const schemaMarks = {
		...defaultMarks,
		...customMarks,
	};

	/* Overwrite defaultOptions with custom supplied nodeOptions */
	Object.keys(nodeOptions).forEach((nodeKey) => {
		const nodeSpec = schemaNodes[nodeKey];
		if (nodeSpec) {
			schemaNodes[nodeKey].defaultOptions = {
				...nodeSpec.defaultOptions,
				...nodeOptions[nodeKey],
			};
		}
	});

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

const parseStyleToObject = (style) => {
	try {
		const styleObj = {};
		const wrappedStyle = `.whatever { ${style} } `;
		const cssAst = css.parse(wrappedStyle);
		const { declarations } = cssAst.stylesheet.rules[0];
		declarations.forEach(({ property, value }) => {
			const camelCaseProperty = camelCaseCss(property);
			styleObj[camelCaseProperty] = value;
		});
		return styleObj;
	} catch (_) {
		return {};
	}
};

/* This function implements a server-friendly (via React)
   DOM renderer based on ProseMirror's DOMOutputSpec structure:
   https://prosemirror.net/docs/ref/#model.DOMOutputSpec
   Having this function allows us to specify a single toDOM()
   function in each schema, and render that with React on the
   server and ProseMirror on the client. */
const renderReactFromSpec = (elem, key, holeContent) => {
	if (!elem) {
		return null;
	}
	if (typeof elem === 'string') {
		return holeContent || elem;
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

	const start = hasAttrs ? 2 : 1;
	if (elem[0] === 'br') {
		children = undefined;
	} else if (holeContent && !Array.isArray(elem[start])) {
		children = holeContent;
	} else if (typeof elem[start] === 'string') {
		children = elem[start];
	} else {
		const childArray = elem.slice(start, elem.length);
		if (childArray.length) {
			children = childArray.map((child, index) => {
				const childKey = `${key}-${index}`;
				return renderReactFromSpec(child, childKey, holeContent);
			});
		}
	}

	if ('class' in attrs) {
		attrs.className = attrs.class;
		delete attrs.class;
	}

	if ('colspan' in attrs) {
		attrs.colSpan = attrs.colspan;
		delete attrs.colspan;
	}

	if ('style' in attrs && typeof attrs.style === 'string') {
		attrs.style = parseStyleToObject(attrs.style);
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
				return renderReactFromSpec(MarkComponent.toDOM(curr), currIndex, prev);
			}, node.text);
		}

		const NodeComponent = schema.nodes[node.type].spec;
		const output = renderReactFromSpec(
			NodeComponent.toDOM({
				...node,
				attrs: { ...node.attrs, key: index },
				type: schema.nodes[node.type],
			}),
			index,
			children,
		);
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

export const importDocJson = (editorView, docJson) => {
	const doc = Node.fromJSON(editorView.state.schema, docJson);
	const tr = editorView.state.tr;
	tr.setSelection(Selection.atStart(editorView.state.doc));
	tr.replaceSelection(new Slice(doc.content, 0, 0));
	editorView.dispatch(tr);
	return doc;
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

export const getKeysAtData = (firstChange, latestChange) => {
	if (!firstChange || !latestChange || !firstChange.toJSON() || !latestChange.toJSON()) {
		return undefined;
	}
	return {
		firstKeyAt: new Date(Object.values(firstChange.toJSON())[0].t),
		latestKeyAt: new Date(Object.values(latestChange.toJSON())[0].t),
	};
};

export const storeCheckpoint = (firebaseRef, docNode, keyNumber) => {
	return firebaseRef.child('checkpoint').set({
		d: compressStateJSON({ doc: docNode.toJSON() }).d,
		k: keyNumber,
		t: firebaseTimestamp,
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

export const jsonToNode = (doc, schema) => {
	return Node.fromJSON(schema, doc);
};

export const getFirebaseDoc = (firebaseRef, schema, versionNumber, updateOutdatedCheckpoint) => {
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
			const getFirstChange = firebaseRef
				.child('changes')
				.orderByKey()
				.limitToFirst(1)
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

			return Promise.all([
				newDoc,
				getChanges,
				getMerges,
				getFirstChange,
				getLatestChange,
				getLatestMerge,
			]);
		})
		.then(
			([newDoc, changesSnapshot, mergesSnapshot, firstChange, latestChange, latestMerge]) => {
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
					stepClientIds.push(
						...new Array(compressedStepsJSON.length).fill(stepContent.c),
					);
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

				/* Allow checkpoint to be stored if it is outdated. */
				/* This is an opportune time to do so since we've */
				/* already built the latest doc. */
				const checkpointOutdated = !!steps.length;
				if (checkpointOutdated && !versionNumber && updateOutdatedCheckpoint) {
					storeCheckpoint(firebaseRef, updatedDoc, mostRecentRemoteKey);
				}
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
					checkpointUpdates: checkpointOutdated
						? getKeysAtData(firstChange, latestChange)
						: undefined,
				};
			},
		)
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
					.sort((foo, bar) => {
						return Number(foo) - Number(bar);
					})
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
						try {
							const thisSelection = Selection.fromJSON(
								currentDoc,
								uncompressSelectionJSON(discussions[discussionId].selection),
							);
							newDiscussions[discussionId] = {
								...discussions[discussionId],
								selection: thisSelection,
							};
						} catch (err) {
							console.warn(`Warning on ${discussionId}: ${err}`);
						}
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
				return;
			}
			console.error(err);
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

export const convertLocalHighlightToDiscussion = (editorView, highlightId, firebaseRef) => {
	const localHighlight = editorView.state.localHighlights$.activeDecorationSet
		.find()
		.filter((decoration) => {
			return decoration.type.attrs && decoration.type.attrs.class;
		})
		.reduce((prev, curr) => {
			const decorationId = curr.type.attrs.class.replace('local-highlight lh-', '');
			if (decorationId === highlightId) {
				return curr;
			}
			return prev;
		}, {});
	const newDiscussionData = formatDiscussionData(
		editorView,
		localHighlight.from,
		localHighlight.to,
	);
	removeLocalHighlight(editorView, highlightId);
	return firebaseRef
		.child('discussions')
		.child(highlightId)
		.set(newDiscussionData);
};

export const getLocalHighlightText = (editorView, highlightId) => {
	const localHighlight = editorView.state.localHighlights$.activeDecorationSet
		.find()
		.filter((decoration) => {
			return decoration.type.attrs && decoration.type.attrs.class;
		})
		.reduce((prev, curr) => {
			const decorationId = curr.type.attrs.class.replace('local-highlight lh-', '');
			if (decorationId === highlightId) {
				return curr;
			}
			return prev;
		}, undefined);
	if (!localHighlight) {
		return null;
	}

	const fromPos = localHighlight.from;
	const toPos = localHighlight.to;
	const exact = editorView.state.doc.textBetween(fromPos, toPos);
	const prefix = editorView.state.doc.textBetween(
		Math.max(0, fromPos - 10),
		Math.max(0, fromPos),
	);
	const suffix = editorView.state.doc.textBetween(
		Math.min(editorView.state.doc.nodeSize - 2, toPos),
		Math.min(editorView.state.doc.nodeSize - 2, toPos + 10),
	);
	return {
		exact: exact,
		prefix: prefix,
		suffix: suffix,
	};
};

export const reanchorDiscussion = (editorView, firebaseRef, discussionId) => {
	const collabPlugin = editorView.state.collaborative$ || {};
	const newCurrentKey = collabPlugin.mostRecentRemoteKey;
	const selection = editorView.state.selection;
	const newAnchor = selection.anchor;
	const newHead = selection.head;

	const transaction = editorView.state.tr;
	transaction.setMeta('removeDiscussion', { id: discussionId });
	editorView.dispatch(transaction);
	firebaseRef
		.child('discussions')
		.child(discussionId)
		.update({
			currentKey: newCurrentKey,
			selection: {
				a: newAnchor,
				h: newHead,
				t: 'text',
			},
		});
};

export const getNotes = (doc) => {
	const citationCounts = {}; /* counts is an object with items of the following form. { citationHtml: { count: citationCount, value: citationValue } } */
	const footnoteItems = [];
	const citationItems = [];

	doc.nodesBetween(0, doc.nodeSize - 2, (node) => {
		if (node.type.name === 'footnote') {
			footnoteItems.push({
				structuredValue: node.attrs.structuredValue,
				unstructuredValue: node.attrs.value,
			});
		}
		if (node.type.name === 'citation') {
			const key = `${node.attrs.value}-${node.attrs.unstructuredValue}`;
			const existingCount = citationCounts[key];
			if (!existingCount) {
				citationCounts[key] = true;
				citationItems.push({
					structuredValue: node.attrs.value,
					unstructuredValue: node.attrs.unstructuredValue,
				});
			}
		}
		return true;
	});

	return {
		footnotes: footnoteItems,
		citations: citationItems,
	};
};

// export const forceRemoveDiscussionHighlight = (editorView, discussionId) => {
// 	const transaction = editorView.state.tr;
// 	transaction.setMeta('removeDiscussion', { id: discussionId });
// 	editorView.dispatch(transaction);
// };
