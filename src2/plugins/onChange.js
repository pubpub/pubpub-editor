import { Plugin, NodeSelection } from 'prosemirror-state';

/* This plugin is used to call onChange with */
/* all of the new editor values. */
export default (schema, props)=> {
	return new Plugin({
		view: ()=> {
			return {
				update: (editorView)=> {
					const updateAttrs = (newAttrs)=> {
						const start = editorView.state.selection.from;
						if (start !== undefined) {
							// const oldNodeAttrs = this.node.attrs;
							const oldNodeAttrs = editorView.state.selection.node.attrs;
							const transaction = editorView.state.tr.setNodeMarkup(
								start,
								null,
								{ ...oldNodeAttrs, ...newAttrs }
							);
							if (editorView.state.selection.node.type.isInline) {
								/* Inline nodeviews lose focus on content change */
								/* this fixes that issue. */
								// const pos = this.getPos();
								const sel = NodeSelection.create(editorView.state.doc, start);
								transaction.setSelection(sel);
							}
							editorView.dispatch(transaction);
						}
					};

					const isNodeView = !!editorView.state.selection.node;
					props.onChange({
						view: editorView,
						selection: editorView.state.selection,
						selectedNode: isNodeView ? editorView.state.selection.node : undefined,
						updateNode: isNodeView ? updateAttrs : undefined,
					});
				}
			};
		}
	});
};
