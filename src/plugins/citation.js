import { Plugin } from 'prosemirror-state';

export default (schema)=> {
	if (!schema.nodes.citation) { return []; }
	return new Plugin({
		appendTransaction: (transactions, oldState, newState)=> {
			const counts = {}; /* counts is an object with items of the following form. { citationHtml: { count: citationCount, value: citationValue } } */
			let didUpdate = false;
			const newTransaction = newState.tr;
			newState.doc.nodesBetween(
				0,
				newState.doc.nodeSize - 2,
				(node, nodePos)=> {
					if (node.type.name === 'citation') {
						const key = `${node.attrs.html}-${node.attrs.unstructuredValue}`;
						const existingCount = counts[key] && counts[key].count;
						const nextCount = Object.keys(counts).length + 1;
						if (existingCount && node.attrs.count !== existingCount) {
							/* If we already have a number for this citation, but */
							/* the current node doesn't have that number, then update. */
							didUpdate = true;
							newTransaction.setNodeMarkup(
								nodePos,
								null,
								{ ...node.attrs, count: existingCount }
							);
							newTransaction.setMeta('citation', true);
						}
						if (!existingCount && node.attrs.count !== nextCount) {
							/* If we don't have a number for this citation and */
							/* the current node doesn't have that the right */
							/* nextNumber, then update. */
							didUpdate = true;
							newTransaction.setNodeMarkup(
								nodePos,
								null,
								{ ...node.attrs, count: nextCount }
							);
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
				}
			);

			/* Check all CitationList nodes to make sure they are updated if */
			/* didUpdate is true, or if the list is empty, but counts is not */
			newState.doc.nodesBetween(
				0,
				newState.doc.nodeSize - 2,
				(node, nodePos)=> {
					if (node.type.name === 'citationList') {
						/* Test whether the html content of the citation list should be */
						/* updated due to new html in individual citations */
						const citationListContentChanged = Object.keys(counts).reduce((prev, curr)=> {
							const currCitationData = counts[curr];
							const prevCitationData = node.attrs.listItems[currCitationData.count] || {};
							const prevKey = `${prevCitationData.html}-${prevCitationData.unstructuredValue}`;
							if (prevKey !== curr) {
								return true;
							}
							return prev;
						}, false);

						if (node.attrs.listItems.length !== Object.keys(counts).length || didUpdate || citationListContentChanged) {
							const listItems = Object.keys(counts).sort((foo, bar)=> {
								if (counts[foo].count < counts[bar].count) { return -1; }
								if (counts[foo].count > counts[bar].count) { return 1; }
								return 0;
							}).map((key)=> {
								return {
									html: counts[key].html,
									value: counts[key].value,
									unstructuredValue: counts[key].unstructuredValue,
									count: counts[key].count,
								};
							});

							didUpdate = true;
							newTransaction.setNodeMarkup(
								nodePos,
								null,
								{ ...node.attrs, listItems: listItems }
							);
							newTransaction.setMeta('citation', true);
						}
					}
					return true;
				}
			);
			if (didUpdate) {
				/* Numbers being updated when html changes causes the node to lose focus. */
				/* This refocuses the node */
				newTransaction.setSelection(newState.selection);
			}
			return didUpdate ? newTransaction : null;
		}
	});
};
