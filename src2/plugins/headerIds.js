import { Plugin } from 'prosemirror-state';

/* This plugin adds an id attribute to each header node. */
/* This id can be used for in-page routing. */
export default ()=> {
	return new Plugin({
		// view: ()=> {
		// 	return {
		// 		update: function(editorView) {
		// 			const transaction = editorView.state.tr;
		// 			let changedId = false;
		// 			editorView.state.doc.forEach((node, offset)=> {
		// 				if (node.type.name === 'heading') {
		// 					const newId = node.textContent.trim().toLowerCase().replace(/ /gi, '-').replace(/[^a-zA-Z0-9-]/gi, '');
		// 					if (node.attrs.id !== newId) {
		// 						changedId = true;
		// 						transaction.setNodeMarkup(
		// 							offset,
		// 							node.type,
		// 							{
		// 								...node.attrs,
		// 								id: newId,
		// 							}
		// 						);
		// 					}
		// 				}
		// 			});
		// 			if (changedId) {
		// 				const sel = NodeSelection.create(newState.doc, newState.selection.from);
		// 				transaction.setSelection(sel);
		// 				editorView.dispatch(transaction);
		// 			}
		// 		}
		// 	};
		// },
		appendTransaction: (transactions, oldState, newState)=> {
			const transaction = newState.tr;
			transaction.setSelection(newState.selection);
			let changedId = false;
			newState.doc.forEach((node, offset)=> {
				if (node.type.name === 'heading') {
					const newId = node.textContent.trim().toLowerCase().replace(/ /gi, '-').replace(/[^a-zA-Z0-9-]/gi, '');
					if (node.attrs.id !== newId) {
						changedId = true;
						transaction.setNodeMarkup(
							offset,
							node.type,
							{
								...node.attrs,
								id: newId,
							}
						);
					}
				}
			});
			if (changedId) {
				// transaction.setSelection(newState.selection);
				// const sel = new Selection(newState.doc.resolve(newState.selection.from), newState.doc.resolve(newState.selection.to));
				// console.log(transaction.selection, newState.selection);
				// transaction.setSelection(newState.selection);
				// const sel = NodeSelection.create(newState.doc, newState.selection.from);
				// transaction.setSelection(sel);
				return transaction;
			}
			return null;
			// return changedId
			// 	? transaction
			// 	: null;
		}
	});
};
