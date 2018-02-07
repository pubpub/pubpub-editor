import { Plugin } from 'prosemirror-state';

const HeaderIdPlugin = new Plugin({
	view: ()=> {
		return {
			update: function(editorView) {
				const topBlocks = editorView.state.doc.content.content;
				topBlocks.reduce((prev, curr)=> {
					if (curr.type.name === 'heading') {
						const newId = curr.textContent.toLowerCase().replace(/ /gi, '-').replace(/[^a-zA-Z0-9-]/gi, '');
						if (curr.attrs.id !== newId) {
							const transaction = editorView.state.tr.setNodeMarkup(
								prev,
								curr.type,
								{
									...curr.attrs,
									id: newId,
								}
							);
							editorView.dispatch(transaction);
						}
					}
					return prev + curr.nodeSize;
				}, 0);
			}
		};
	},

});

export default HeaderIdPlugin;
