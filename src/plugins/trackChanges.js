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
