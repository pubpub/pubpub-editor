import { Plugin } from 'prosemirror-state';
import { Decoration, DecorationSet } from 'prosemirror-view';

// DONE: Track formatting
// Track new lines
// Track nodes - this seems to be always done with ReplaceStep. So we need to handle it there.
// DONE: Restore initial state. If the invert function is equivalent to null - then remove
// NOPE: Maybe I need to be calling changeset on the stored inverted steps.
// DONE: blockquote error - when trying to use > to generate a block, same for bullet list
// DONE: Can't delete a bullet list item in suggest changes mode
// Can't delete a new paragraph you made in track changes

/*
Replace Inserts:
	On accept, remove mark.
	On reject, make selection on mark, removeSelection.
Replace Deletes:
	On accept, make selection on mark, removeSelection.
	on reject, remove mark.
Mark Inserts:
	On accept, remove mark
	On reject, remove markType listed in mark
Mark Deletes:
	On accept, remove mark
	On reject, remove markType listed in mark
*/


// For diffing arbitrary versions:
// Get the step number of the base, get the step number of the active.
// Build the doc up to the step number of the base, use that to init changeset.
// Get and apply all steps between baseStep and activeStep, render contents from changeset.
// We could do this on the fly, but we would need to have the stepNumber of each version stored.
// We may have to go back and try to compute this for all pubs.



/*

For joining paragraphs and the such, we probably want to check the inverted step.
When you delete text-paragraph break-text, that will manifest as three changes. Delete text, merge paragraph, delete text.
Need to store what was replaced - so we can invert properly. e.g. rejecting the replacing of a paragraph with text with an image isn't just removing the image.
So what - we store the slice of the inverted step?
Or - we don't need to store deleted slices, since we ar applying the inverse and can simply approve the deletion.
I could store timestamp on changes, and use that to group items that are from a single event. Would have to take the existing timestamp if it exists, otherwise create new one.

On paragraph delete, we store on the second paragraph a 'merge paragraph' flag in the attrs.
On paragraph create, store a create flag


If replaces a range, check if it is a single node (check if openstart, openend).
	Apply inverted
	Find text bits and apply marks
	Find nodes and apply marks
	Nodes replacing paragraphs (e.g. inserting an image on a blank line) cause to !== from, so we shouldnt invert that
If doesn't replace range, 
	find text bits and apply marks
	Find nodes and apply marks
	Mark whether it has openstart/openend, so we know whether to join paragraphs on it's removal
If change mark, do that step
If isReplaceAround,
	Mark the node, and mark what it was beforehand?
	Keep track of structure
*/


class TrackChangesPlugin extends Plugin {
	constructor({ pluginKey, isActive, usersData, userId }) {
		super({ key: pluginKey });
		this.spec = {
			appendTransaction: (transactions, oldState, newState)=> {
				const insertionMarkType = newState.schema.marks.insertion;
				const deletionMarkType = newState.schema.marks.deletion;
				const inputRulesPluginKey = newState.plugins.reduce((prev, curr)=> {
					if (curr.spec.isInputRules) { return curr.key; }
					return prev;
				}, undefined);

				if (!isActive()) {
					/* If trackChanges if off, we need to make sure that */
					/* changes made inside changeMarks don't inherit the mark */
					const clearMarksTransaction = newState.tr;
					transactions.forEach((transaction)=> {
						transaction.steps.forEach((step)=> {
							const isReplace = step.jsonID === 'replace';
							if (isReplace) {
								const stepFrom = step.from;
								const sliceSize = step.slice.content.size;
								if (step.slice) {
									clearMarksTransaction.removeMark(stepFrom, stepFrom + sliceSize, insertionMarkType);
									clearMarksTransaction.removeMark(stepFrom, stepFrom + sliceSize, deletionMarkType);
								}
							}
						});
					});
					return clearMarksTransaction;
				}

				/* If TrackChanges is active: */
				const newTransaction = newState.tr;
				transactions.filter((transaction)=> {
					/* Don't apply insertions/deletions if */
					/* the transaction is a history$ item */
					const isHistory = transaction.meta.history$;
					return !isHistory;
				}).forEach((transaction)=> {
					const isInputRulesPlugin = transaction.meta[inputRulesPluginKey];
					transaction.steps.forEach((step)=> {
						// const invertedStep = step.invert(oldState.doc);
						console.log('-------------');
						console.log(JSON.stringify(step.toJSON(), null, 4));
						// console.log(JSON.stringify(invertedStep.toJSON(), null, 4));
						const isInsert = step.from === step.to;
						const isReplace = step.jsonID === 'replace';
						const isAddMark = step.jsonID === 'addMark';
						const isRemoveMark = step.jsonID === 'removeMark';
						const isReplaceAround = step.jsonID === 'replaceAround';
						if (isInsert && isReplace) {
							/* If we're inserting content, wrap it in add mark */
							/* and make sure it does not have a deletion mark */
							// console.log(step.slice);
							newTransaction.addMark(
								step.from,
								step.from + step.slice.size,
								insertionMarkType.create({ userId: userId, editType: 'replace' })
							);
							newTransaction.removeMark(
								step.from,
								step.from + step.slice.size,
								deletionMarkType
							);

							step.slice.content.nodesBetween(
								0,
								step.slice.size,
								(node, nodePos)=> {
									// TODO: Is this sufficient for applying data to new nodes?
									// Do we want to label every node? Or do we just want to label the top-most node.
									// Probably every, because table rows that are added, might be tricky to resolve, if
									// we are otherwise checking for upper nodes. Tends to be tough to navigate upward
									// through the tree, right? So finding if something is a child might be tricky.
									// Doesn't hurt to label every node, does it? We just have to figure out why it isn't working

									// console.log(node);
									if (node.type.name !== 'text') {
										console.log('in here', node.type.name, nodePos, nodePos);
										console.log('-----');
										console.log(transaction.doc.nodeAt(nodePos + step.slice.openStart - 3) && transaction.doc.nodeAt(nodePos + step.slice.openStart - 3).type.name);
										console.log(transaction.doc.nodeAt(nodePos + step.slice.openStart - 2) && transaction.doc.nodeAt(nodePos + step.slice.openStart - 2).type.name);
										console.log(transaction.doc.nodeAt(nodePos + step.slice.openStart - 1) && transaction.doc.nodeAt(nodePos + step.slice.openStart - 1).type.name);
										console.log(transaction.doc.nodeAt(nodePos + step.slice.openStart) && transaction.doc.nodeAt(nodePos + step.slice.openStart).type.name);
										console.log(transaction.doc.nodeAt(nodePos + step.slice.openStart + 1) && transaction.doc.nodeAt(nodePos + step.slice.openStart + 1).type.name);
										console.log(transaction.doc.nodeAt(nodePos + step.slice.openStart + 2) && transaction.doc.nodeAt(nodePos + step.slice.openStart + 2).type.name);
										console.log(transaction.doc.nodeAt(nodePos + step.slice.openStart + 3) && transaction.doc.nodeAt(nodePos + step.slice.openStart + 3).type.name);
										console.log('-----');
										
										newTransaction.setNodeMarkup(nodePos + step.slice.openStart, null, { ...node.attrs, trackChangesData: { userId: userId } }, []);
									}
									// return false;
								},
								step.from
							);
						} else if (isReplace && !isInputRulesPlugin) {
							// TODO: It seems that some inserts are not isInsert.
							// Inserting an image into a blank paragraph is actually replacing
							// the paragraph - causing step.to !== step.from
							// We need to handle marking nodes when this is the case.


							/* If we are deleting content... */
							/* First invert the step to 'undo' the change */
							/* and then apply the deletion marker */
							const invertedStep = step.invert(oldState.doc);
							newTransaction.step(invertedStep);
							newTransaction.addMark(
								step.from,
								step.to,
								deletionMarkType.create({ userId: userId })
							);

							/* Check if any of the content that was deleted was */
							/* a suggested insertion by the same user. If so */
							/* remove those insertion suggestions */
							newTransaction.steps.forEach((appendedStep)=> {
								if (appendedStep.jsonID === 'replace') {
									let runningOffset = 0;
									appendedStep.slice.content.content.forEach((node)=> {
										if (node.type.name === 'text') {
											const hasInsertionMark = node.marks.reduce((prev, curr)=> {
												if (curr.type.name === 'insertion' && curr.attrs.userId === userId) {
													return true;
												}
												return prev;
											}, false);

											if (hasInsertionMark) {
												newTransaction.delete(
													appendedStep.from + runningOffset,
													appendedStep.from + runningOffset + node.nodeSize
												);
											} else {
												runningOffset += node.nodeSize;
											}
										} else {
											// TODO: is this enough to remove inserted nodes?
											// If so, it can be merged with the statement above.
											// Do isInsertion = type === 'text' ? code : code;
											// And then the deletion, or offset update is the same
											const hasInsertionData = !!node.attrs.trackChangesData.userId;
											if (hasInsertionData) {
												newTransaction.delete(
													appendedStep.from + runningOffset,
													appendedStep.from + runningOffset + node.nodeSize
												);
											} else {
												runningOffset += node.nodeSize;
											}
										}
									});
								}
							});

							/* Inverting the step causes the cursor to jump. We want to */
							/* correct this in all situations except when forward-delete is used */
							const insertionSize = step.slice.size;
							if (oldState.selection.to !== newState.selection.to && !insertionSize) {
								newTransaction.setSelection(newState.selection);
							}

							/* If there is an insertion with the replaceStep, add that slice */
							/* back in and apply an insertion mark */
							if (insertionSize) {
								newTransaction.replaceSelection(step.slice);
								newTransaction.addMark(
									oldState.selection.to,
									oldState.selection.to + insertionSize,
									insertionMarkType.create({ userId: userId })
								);
							}
						} else if (isAddMark || isRemoveMark) {
							/* If formatting change: */
							/* Get the marks across the range of the current selection */
							/* Note what types of formatting change was made */
							/* Remove those marks and add new marks with updated formatting */
							/* change information. */
							const stepMarkName = step.mark.type.name;
							/* Iterate through all nodes within the range of the transaction */
							transaction.doc.nodesBetween(
								transaction.selection.from,
								transaction.selection.to,
								(node, nodePos)=> {
									if (node.type.name === 'text') {
										const nodeFrom = Math.max(nodePos, transaction.selection.from);
										const nodeTo = Math.min(nodePos + node.nodeSize, transaction.selection.to);
										const nullInsertionMark = insertionMarkType.create({
											attrs: { addedFormats: [], removedFormats: [] }
										});

										/* Check if any of the marks on this node are an existing insertion mark */
										const previousInsertionMark = node.marks.reduce((prev, curr)=> {
											if (curr.type.name === 'insertion') { return curr; }
											return prev;
										}, nullInsertionMark);

										/* Only proceed if the existing insertion mark is not a replace type */
										/* (e.g. it is null or formatting) */
										if (previousInsertionMark.attrs.editType !== 'replace') {
											/* Check if the mark of the step has been applied to this node */
											const stepMarkApplied = node.marks.reduce((prev, curr)=> {
												if (curr.type.name === stepMarkName) { return true; }
												return prev;
											}, false);

											/* Remove the previous insertion mark */
											/* We will either replace it with one with new attrs */
											/* or not replace it because we have undone the original */
											/* suggested formatting change. */
											newTransaction.removeMark(
												nodeFrom,
												nodeTo,
												previousInsertionMark
											);

											/* If stepMarkApplied, stepMarkName can be in addedFormats or nowhere */
											/* If !stepMarkApplied, stepMarkName can be in removeFormats or nowhere */
											const prevAddedFormats = previousInsertionMark.attrs.addedFormats;
											const prevRemovedFormats = previousInsertionMark.attrs.removedFormats;
											let nextAddedFormats;
											let nextRemovedFormats;
											if (stepMarkApplied) {
												nextAddedFormats = prevRemovedFormats.indexOf(stepMarkName) > -1 ? prevAddedFormats : [...prevAddedFormats, stepMarkName];
												nextRemovedFormats = prevRemovedFormats.filter((format)=> { return format !== stepMarkName; });
											}
											if (!stepMarkApplied) {
												nextRemovedFormats = prevAddedFormats.indexOf(stepMarkName) > -1 ? prevRemovedFormats : [...prevRemovedFormats, stepMarkName];
												nextAddedFormats = prevAddedFormats.filter((format)=> { return format !== stepMarkName; });
											}

											/* If there is any suggested formatting, add the mark */
											if (nextAddedFormats.length || nextRemovedFormats.length) {
												newTransaction.addMark(
													nodeFrom,
													nodeTo,
													insertionMarkType.create({
														userId: userId,
														editType: 'formatting',
														addedFormats: nextAddedFormats,
														removedFormats: nextRemovedFormats,
													})
												);
											}
										}
									}
									return true;
								}
							);
						} else if (isReplaceAround) {
							// console.log('Ya we replace around!');
							// It seems for these we want to use decorations to style the nodes.
							// we can pass some data through attrs that are applied on each node?
							// Currently this is in schema setup - can we do this in this plugin?
							// Need to find a better way to do appendMetaAttr
							// How do we detect when a paragraph is split?
							// transaction.doc.forEach((node, offset)=> {
							// 	console.log(offset);
							// 	newTransaction.setNodeMarkup(offset, null, { ...node.attrs, class: 'cat', trackChangesData: { userId: userId } }, []);
							// });
							const newNode = newTransaction.doc.nodeAt(step.from);
							// console.log('newNode', newNode);
							newTransaction.setNodeMarkup(step.from, null, { ...newNode.attrs, trackChangesData: { userId: userId } }, []);
							// transaction.doc.nodesBetween(
							// 	step.from,
							// 	step.to,
							// 	(node, nodePos)=> {
							// 		newTransaction.setNodeMarkup(nodePos, null, node.attrs, []);
							// 		return false;
							// 	},
							// );
						} else {
							console.error('Danger! We got a step we dont have trackChanges support for: ', step);
						}
					});
				});

				return newTransaction;
			}
		};
		this.props = {
			decorations: (editorState)=> {
				const decorations = [];
				editorState.doc.forEach((node, offset)=> {
					// console.log(node.attrs);
					if (node.attrs.trackChangesData.userId) {
						const decoration = Decoration.node(
							offset,
							offset + node.nodeSize,
							{ class: 'wow' }
						);
						decorations.push(decoration);
					}
				});
				return DecorationSet.create(editorState.doc, decorations);
			}
		};
	}
}

export default TrackChangesPlugin;
