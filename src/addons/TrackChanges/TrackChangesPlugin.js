import { Plugin } from 'prosemirror-state';

// Track formatting
// Track new lines
// Track nodes
// DONE: Restore initial state. If the invert function is equivalent to null - then remove
// NOPE: Maybe I need to be calling changeset on the stored inverted steps.

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
							const stepFrom = step.from;
							const sliceSize = step.slice.content.size;
							if (step.slice) {
								clearMarksTransaction.removeMark(stepFrom, stepFrom + sliceSize, insertionMarkType);
								clearMarksTransaction.removeMark(stepFrom, stepFrom + sliceSize, deletionMarkType);
							}
						});
					});
					return clearMarksTransaction;
				}

				/*
				Inserts:
					On accept, remove mark.
					On reject, make selection on mark, removeSelection.
				Deletes:
					On accept, make selection on mark, removeSelection.
					on reject, remove mark.
				*/
				const newTransaction = newState.tr;
				transactions.filter((transaction)=> {
					/* Don't apply insertions/deletions if */
					/* the transaction is a history$ item */
					return !transaction.meta.history$;
				}).forEach((transaction)=> {
					transaction.steps.forEach((step)=> {
						const isInsert = step.from === step.to;
						const isReplace = step.jsonID === 'replace';
						if (isInsert && isReplace) {
							/* If we're inserting content, wrap it in add mark */
							/* and make sure it does not have a deletion mark */
							newTransaction.addMark(
								step.from,
								step.from + step.slice.size,
								newState.schema.marks.insertion.create({ userId: userId })
							);
							newTransaction.removeMark(
								step.from,
								step.from + step.slice.size,
								newState.schema.marks.deletion.create({ userId: userId })
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
								newState.schema.marks.deletion.create({ userId: userId })
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
									newState.schema.marks.insertion.create({ userId: userId })
								);
							}
						}
					});
				});

				// transaction.steps.forEach((step)=> {
				// 		if (step.jsonID === 'addMark') {
				// 			console.log('here');
				// 			newTransaction.addMark(
				// 				step.from,
				// 				step.to,
				// 				newState.schema.marks.insertion.create({ userId: userId })
				// 			);
				// 		}
				// 		if (step.jsonID === 'removeMark') {
				// 			newTransaction.addMark(
				// 				step.from,
				// 				step.to,
				// 				newState.schema.marks.deletion.create({ userId: userId })
				// 			);
				// 		}
				// 	});
				return newTransaction;
			}
		};
	}
}

export default TrackChangesPlugin;
