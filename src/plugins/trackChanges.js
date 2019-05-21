import { Plugin } from 'prosemirror-state';

/* This plugin adds marks to insertions and */
/* inverts deletions, reapplying them with a mark. */
export default (schema, props) => {
	return new Plugin({
		appendTransaction: (transactions, oldState, newState) => {
			console.log(transactions);
			const newTransaction = newState.tr;
			transactions.forEach((transaction) => {
				transaction.steps.forEach((step) => {
					newTransaction.addMark(
						step.from,
						step.from + step.slice.content.size,
						newState.schema.marks.strong.create(),
					);
				});
			});

			return newTransaction;
		},
	});
};


/*
[1,2,3,4]
(1, [2,3,4]) -> [1, A, [2a, 3a, 4a]]
(2a, [3a, 4a]) -> [2a, B, [3ab, 4ab]]

[1, A, 2a, B]

adjustSteps(currStep, futureSteps) -> [currStep, ...newSteps, futureStepsMapped]
	


bananas -> banana
1: Step to remove 's'
2: Inverted Step to put 's'
3: Apply a mark over the inverted step slice
*/
