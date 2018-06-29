import { Plugin, Selection } from 'prosemirror-state';
import { ChangeSet } from 'prosemirror-changeset';

// Track formatting
// Track new lines
// Track nodes
// Restore initial state. If the invert function is equivalent to null - then remove
// Maybe I need to be calling changeset on the stored inverted steps.

// I need to get all marks at the position, and add them to a changeset, and then go.

// Given a thing, we want to look at all the marks, calculate the net-total mark
// and then apply that. That is what changeset helps us do

class TrackChangesPlugin extends Plugin {
	constructor({ pluginKey, isActive, usersData, userId }) {
		super({ key: pluginKey });
		this.spec = {
			appendTransaction: (transactions, oldState, newState)=> {
				if (!isActive()) {
					console.log(transactions);
					// return null;
					const removeMarksTransaction = newState.tr;
					transactions.forEach((transaction)=> {
						transaction.steps.forEach((step)=> {
							removeMarksTransaction.removeMark(step.from, step.from + step.slice.content.size, newState.schema.marks.insertion);
							removeMarksTransaction.removeMark(step.from, step.from + step.slice.content.size, newState.schema.marks.deletion);
						});
					});
					return removeMarksTransaction;
				}
				console.log(transactions)
				const newTransaction2 = newState.tr;
				transactions.filter((transaction)=> {
					// Don't apply insertions/deletions if the transaction is a history$ item
					return !transaction.meta.history$;
				}).forEach((transaction)=> {
					transaction.steps.forEach((step)=> {
						console.log(step);
						const isInsert = step.from === step.to;
						const isReplace = step.jsonID = 'replace';
						if (isInsert && isReplace) {
							console.log('insert');
							newTransaction2.addMark(
								step.from,
								step.from + step.slice.size,
								newState.schema.marks.insertion.create({ userId: userId })
							);
						} else if (isReplace) {
							console.log('deletion');
							console.log('to marks', transaction.selection.$to.marks());
							console.log('from marks', transaction.selection.$from.marks());
							console.log('marks across', transaction.selection.$from.marksAcross(transaction.selection.$to));

							const invertedStep2 = step.invert(oldState.doc);
							newTransaction2.step(invertedStep2);
							newTransaction2.addMark(
								step.from,
								step.to,
								newState.schema.marks.deletion.create({ userId: userId })
							);

							console.log(newTransaction2);
							// debugger;

							/* Check if any of the content we just deleted was actually our own */
							/* and if so, remove */
							newTransaction2.steps.forEach((thisStep)=> {
								if (thisStep.jsonID === 'replace') {
									// Does slice.content.content always exist?
									// Test with pure deletion
									let runningOffset = 0;
									thisStep.slice.content.content.forEach((node)=> {
										if (node.type.name === 'text') {
											const hasInsertionMark = node.marks.reduce((prev, curr)=> {
												if (curr.type.name === 'insertion') {
													// && curr.attrs.userId = myUserId
													return true;
												}
												return prev;
											}, false);
											if (hasInsertionMark) {
												console.log(thisStep.from, runningOffset, node.nodeSize);
												// Can deleteRange be more useful here?
												newTransaction2.setSelection(new Selection(newTransaction2.doc.resolve(thisStep.from + runningOffset), newTransaction2.doc.resolve(thisStep.from + runningOffset + node.nodeSize)));
												newTransaction2.deleteSelection();
											} else {
												runningOffset += node.nodeSize;
											}
										}
									});
								}
							});


							// When it's fn-delete, they all stay the same
							// When its delete, new is one less
							// when it's double click,, select ltr new state is to the left
							console.log(oldState.selection.to, oldState.selection.from, newState.selection.to, newState.selection.from, )
							const hasInsertion = step.slice.size;
							/* Inverting the step causes the cursor to jump. We want to */
							/* correct this in all situations except when forward-delete is used */
							console.log('content', oldState.selection.content());
							if (oldState.selection.to !== newState.selection.to && !hasInsertion) {
								newTransaction2.setSelection(newState.selection);
							}
							
							/* If there is an insertion with the replaceStep, add that slice back in */
							if (hasInsertion) {
								newTransaction2.replaceSelection(step.slice);
								newTransaction2.addMark(
									oldState.selection.to,
									oldState.selection.to + step.slice.size,
									newState.schema.marks.insertion.create({ userId: userId })
								);
							}

						}
					});
				});

				/*
				Inserts:
					On accept, remove mark.
					On reject, make selection on mark, removeSelection.
				Deletes:
					On accept, make selection on mark, removeSelection.
					on reject, remove mark.
				*/
				
				// Handle overwriting
				// If you're in a deletion mark, don't add the insert
				// If the whole thing is in a insert mark, don't invert
				return newTransaction2;


				/*
				For each transaction
				get the marks at the curent position
				from each mark, take data.genesisStep
				Create changeset
				Add genesis steps
				Add steps from transaction
				Remove all marks
				Add marks according to changeset
	
				*/
				// How do we tell which steps go with which marks? So we can invert?
				// How do we compute genesisStep, using combine. The data we add when we addStep included the stepJSON
				// How do we tell whether the marks are to the left or right? Maybe changeset does that?
				// Which doc do we begin creating the changeset from?
				//		Does it make sense to just do the above on the inversions? Would
				// 		that let us get away with using newDoc only?
				// 		If the two inversions cancel out - isn't that enough?
				// We can cancel insertion - but not cancel deletions? 
				// Replace selections that aren't an empty selection might need to be treated specially
				// Marks are just a way to keep track of stepchanges. Marks always represent the change to be made on accept/reject.
				// But then I'll have to map the marks?
				// Can't the marks just be the representation of the change themselves?


				// For each step


				// console.log(transactions);
				// console.log('oldState', oldState);
				console.log('newState', newState);


				// const nodeAtCurrentPos = newState.doc.nodeAt()
				let changeSet = ChangeSet.create(oldState.doc, {
					compare: (a, b)=> {
						console.log('compare', a, b);
						return a.userId === b.userId;
					},
					combine: (a, b)=> {
						console.log('combine', a, b);
						// I think combine will at some point have to merge steps
						// So that the invert step is functional
						// You add some content.
						// Then add in the middle.
						// You need to invert to remove the whole thing
						// We'll pull the step from the a.invertJson
						// and do Step.fromJson(a.invertJson).merge(Step(fromJson(b.invertJson)))

						return a;
					}
				});
				let invertedStep;
				// const newUserId = Math.random() < 0.1 ? userId + 1 : userId ;
				const newTransaction = newState.tr;
				transactions.filter((transaction)=> {
					// Don't apply insertions/deletions if the transaction is a history$ item
					return !transaction.meta.history$;
				}).forEach((transaction)=> {
					console.log(transaction);
					changeSet = changeSet.addSteps(
						transaction.doc,
						transaction.mapping.maps,
						{ userId: userId }
					);
					const mergedStep = transaction.steps.reduce((prev, curr)=> {
						// invertedSteps.push(step.invert(oldState.doc)));
						if (!prev) { return curr; }
						return prev.merge(curr);
					}, undefined);
					transaction.steps.forEach((step)=> {
						if (step.jsonID === 'addMark') {
							console.log('here');
							newTransaction.addMark(
								step.from,
								step.to,
								newState.schema.marks.insertion.create({ userId: userId })
							);
						}
						if (step.jsonID === 'removeMark') {
							newTransaction.addMark(
								step.from,
								step.to,
								newState.schema.marks.deletion.create({ userId: userId })
							);
						}
					});
					if (mergedStep) {
						invertedStep = mergedStep.invert(oldState.doc);
					}
				});

				console.log(changeSet);
				// console.log('invertedStep', invertedStep);

				// console.log(oldState.selection.to, newState.selection.to);
				// invertedStep.apply(newState.doc);

				// We produce two 'reject' steps to store.
				// One that is based off of the mergedStep for insert rejects.
				// And one that is based off of invertedStep for deletion rejects

				
				changeSet.inserted.forEach((insertion)=> {
					newTransaction.addMark(
						insertion.from,
						insertion.to,
						newState.schema.marks.insertion.create({ userId: insertion.data.userId })
					);
				});
				// console.log(invertedStep.invert(oldState.doc).toJSON());
				// const doubleInverted = invertedStep.invert(oldState.doc);
				if (invertedStep && changeSet.deleted.length && !changeSet.inserted.length) {
					newTransaction.step(invertedStep);
					/* Applying the inverting step causes the cursor to jump to the end */
					/* causing a bug when using the delete key. So, set the selection */
					/* to what it was at the point of newState */
					// This isn't quite right yet. Selections with delete still wind up being funky
					if (oldState.selection.to - newState.selection.to === 1) {
						newTransaction.setSelection(newState.selection);
					}
				}
				changeSet.deleted.forEach((deletion)=> {
					newTransaction.addMark(
						deletion.from,
						deletion.to,
						newState.schema.marks.deletion.create({ userId: deletion.data.userId })
					);
				});

				// const marksAtTo = newTransaction.selection.$to.marks();
				// marksAtTo.forEach
				return newTransaction;
			}
		};
	}
}

export default TrackChangesPlugin;
