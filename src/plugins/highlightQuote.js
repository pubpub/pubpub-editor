import { Plugin } from 'prosemirror-state';
import { Slice, Fragment } from 'prosemirror-model';

export default (schema, props) => {
	if (!schema.nodes.highlightQuote) {
		return [];
	}
	return new Plugin({
		props: {
			transformPasted(slice) {
				const node = slice.content.content[0];
				const singleChild = slice.content.childCount === 1;
				const matchesString = /^(https:\/\/){1}(.+)(\/pub\/)(.+)(?=(.*to=[0-9]+))(?=(.*from=[0-9]+))/.test(
					node.textContent.trim(),
				);
				// const primaryEditorState = primaryEditorRef.state.editorState;
				// console.log(props.getHighlightContent, singleChild)
				if (props.getHighlightContent && singleChild && matchesString) {
					const to = Number(node.textContent.match(/.*to=([0-9]+)/)[1]);
					const from = Number(node.textContent.match(/.*from=([0-9]+)/)[1]);
					const newNodeData = props.getHighlightContent(from, to);
					// let exact = '';
					// primaryEditorState.doc.slice(from, to).content.forEach((sliceNode)=>{ exact += sliceNode.textContent; });
					// let prefix = '';
					// primaryEditorState.doc.slice(Math.max(0, from - 10), Math.max(0, from)).content.forEach((sliceNode)=>{ prefix += sliceNode.textContent; });
					// let suffix = '';
					// primaryEditorState.doc.slice(Math.min(primaryEditorState.doc.nodeSize - 2, to), Math.min(primaryEditorState.doc.nodeSize - 2, to + 10)).content.forEach((sliceNode)=>{ suffix += sliceNode.textContent; });
					// console.log(to, from, exact, prefix, suffix);
					const newNode = node.type.schema.nodes.highlightQuote.create(newNodeData);
					/* TODO: this doesn't paste correctly inline */
					return new Slice(
						Fragment.fromArray([newNode, node.type.schema.nodes.paragraph.create()]),
						slice.openStart,
						slice.openEnd,
					);
				}
				return slice;
			},
		},
	});
};
