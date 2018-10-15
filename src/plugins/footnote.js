import { Plugin } from 'prosemirror-state';

export default (schema)=> {
	if (!schema.nodes.footnote) { return []; }
	return new Plugin({
		appendTransaction: (transactions, oldState, newState)=> {
			let footnoteCount = 1;
			const footnoteItems = [];
			let didUpdate = false;
			const newTransaction = newState.tr;
			newState.doc.nodesBetween(
				0,
				newState.doc.nodeSize - 2,
				(node, nodePos)=> {
					if (node.type.name === 'footnote') {
						if (node.attrs.count !== footnoteCount) {
							didUpdate = true;
							newTransaction.setNodeMarkup(
								nodePos,
								null,
								{ ...node.attrs, count: footnoteCount }
							);
							newTransaction.setMeta('footnote', true);
						}
						footnoteItems.push({
							count: footnoteCount,
							value: node.attrs.value,
							structuredValue: node.attrs.structuredValue,
							structuredHtml: node.attrs.structuredHtml
						});
						footnoteCount += 1;
					}
					return true;
				}
			);

			/* Check all FootnoteList nodes to make sure they are updated if */
			/* didUpdate is true, or if the list is empty, but counts is not */
			newState.doc.nodesBetween(
				0,
				newState.doc.nodeSize - 2,
				(node, nodePos)=> {
					if (node.type.name === 'footnoteList') {
						/* Test whether the values of the footnote list should be */
						/* updated due to new values in individual footnotes */
						const footnoteContentChanged = footnoteItems.reduce((prev, curr, index)=> {
							const prevFootnoteData = node.attrs.listItems[index] || {};
							if (prevFootnoteData.value !== curr.value || prevFootnoteData.structuredValue !== curr.structuredValue) {
								return true;
							}
							return prev;
						}, false);

						if (node.attrs.listItems.length !== footnoteItems.length || didUpdate || footnoteContentChanged) {
							didUpdate = true;
							newTransaction.setNodeMarkup(
								nodePos,
								null,
								{ ...node.attrs, listItems: footnoteItems }
							);
							newTransaction.setMeta('footnote', true);
						}
					}
					return true;
				}
			);

			return didUpdate ? newTransaction : null;
		}
	});
};
