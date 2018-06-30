import { Plugin } from 'prosemirror-state';

// DONE: Track formatting
// Track new lines
// Track nodes
// DONE: Restore initial state. If the invert function is equivalent to null - then remove
// NOPE: Maybe I need to be calling changeset on the stored inverted steps.
// blockquote error - when trying to use > to generate a block, same for bullet list

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

class TrackChangesPlugin extends Plugin {
	constructor({ pluginKey, isActive, usersData, userId }) {
		super({ key: pluginKey });
		this.spec = {
			appendTransaction: (transactions, oldState, newState)=> {
				const insertionMarkType = newState.schema.marks.insertion;
				const deletionMarkType = newState.schema.marks.deletion;
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
					return !transaction.meta.history$;
				}).forEach((transaction)=> {
					transaction.steps.forEach((step)=> {
						const isInsert = step.from === step.to;
						const isReplace = step.jsonID === 'replace';
						const isAddMark = step.jsonID === 'addMark';
						const isRemoveMark = step.jsonID === 'removeMark';
						if (isInsert && isReplace) {
							/* If we're inserting content, wrap it in add mark */
							/* and make sure it does not have a deletion mark */
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
						} else if (isReplace) {
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
						}
					});
				});

				return newTransaction;
			}
		};
	}
}

export default TrackChangesPlugin;
