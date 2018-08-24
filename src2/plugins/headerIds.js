import { Plugin } from 'prosemirror-state';

/* This plugin adds an id attribute to each header node. */
/* This id can be used for in-page routing. */
export default ()=> {
	return new Plugin({
		view: ()=> {
			return {
				update: function(editorView) {
					editorView.state.doc.forEach((node, offset)=> {
						if (node.type.name === 'heading') {
							const newId = node.textContent.trim().toLowerCase().replace(/ /gi, '-').replace(/[^a-zA-Z0-9-]/gi, '');
							if (node.attrs.id !== newId) {
								const transaction = editorView.state.tr.setNodeMarkup(
									offset,
									node.type,
									{
										...node.attrs,
										id: newId,
									}
								);
								editorView.dispatch(transaction);
							}
						}
					});
				}
			};
		},
	});
};
