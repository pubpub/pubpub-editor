import { Decoration, DecorationSet } from 'prosemirror-view';
import { Plugin } from 'prosemirror-state';

const HeaderIdPlugin = new Plugin({
	view: ()=> {
		return {
			update: function(editorView) {
				const topNode = editorView.state.selection.$from.node(1);
				if (topNode.type.name === 'heading') {
					const headingPos = editorView.state.selection.$from.start(1);
					const newId = topNode.textContent.toLowerCase().replace(/ /gi, '-').replace(/[^a-zA-Z0-9-]/gi, '');
					if (topNode.attrs.id !== newId) {
						const transaction = editorView.state.tr.setNodeMarkup(
							headingPos - 1,
							topNode.type,
							{
								...topNode.attrs,
								id: newId,
							}
						);
						editorView.dispatch(transaction);	
					}
				}
			}
		};
	},

});

export default HeaderIdPlugin;
