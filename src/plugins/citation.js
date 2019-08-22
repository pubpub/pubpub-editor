import { Plugin } from 'prosemirror-state';

export default (schema) => {
	if (!schema.nodes.citation) {
		return [];
	}
	return new Plugin({
		appendTransaction: (transactions, oldState, newState) => {
			const counts = {}; /* counts is an object with items of the following form. { citationHtml: { count: citationCount, value: citationValue } } */
			let didUpdate = false;
			const newTransaction = newState.tr;
			newState.doc.nodesBetween(0, newState.doc.nodeSize - 2, (node, nodePos) => {
				if (node.type.name === 'citation') {
					const key = `${node.attrs.value}-${node.attrs.unstructuredValue}`;
					const existingCount = counts[key] && counts[key].count;
					const nextCount = Object.keys(counts).length + 1;
					if (existingCount && node.attrs.count !== existingCount) {
						/* If we already have a number for this citation, but */
						/* the current node doesn't have that number, then update. */
						didUpdate = true;
						newTransaction.setNodeMarkup(nodePos, null, {
							...node.attrs,
							count: existingCount,
						});
						newTransaction.setMeta('citation', true);
					}
					if (!existingCount && node.attrs.count !== nextCount) {
						/* If we don't have a number for this citation and */
						/* the current node doesn't have that the right */
						/* nextNumber, then update. */
						didUpdate = true;
						newTransaction.setNodeMarkup(nodePos, null, {
							...node.attrs,
							count: nextCount,
						});
						newTransaction.setMeta('citation', true);
					}
					if (!existingCount) {
						counts[key] = {
							count: nextCount,
							value: node.attrs.value,
							html: node.attrs.html,
							unstructuredValue: node.attrs.unstructuredValue,
						};
					}
				}
				return true;
			});

			if (didUpdate) {
				/* Numbers being updated when html changes causes the node to lose focus. */
				/* This refocuses the node */
				newTransaction.setSelection(newState.selection);
			}
			return didUpdate ? newTransaction : null;
		},
	});
};
