// import React from 'react';
// import Footnote from '../components/Footnote/Footnote';
// import FootnoteList from '../components/FootnoteList/FootnoteList';

export default {
	footnote: {
		atom: true,
		attrs: {
			value: { default: '' },
			structuredValue: { default: '' },
			structuredHtml: { default: '' },
			count: { default: 0 },
		},
		parseDOM: [
			{
				tag: 'span',
				getAttrs: (node) => {
					if (node.getAttribute('data-node-type') !== 'footnote') {
						return false;
					}
					return {
						value: node.getAttribute('data-value') || '',
						structuredValue: node.getAttribute('data-structured-value') || '',
						structuredHtml: node.getAttribute('data-structured-html') || '',
						count: Number(node.getAttribute('data-count')) || 0,
					};
				},
			},
			// {
			// 	style: 'mso-special-character',
			// 	priority: 60,
			// 	getAttrs: (node)=> {
			// 		console.log('node', node);
			// 		return {
			// 			value: 'wppr' || node.getAttribute('data-value') || '',
			// 			count: 99 || Number(node.getAttribute('data-count')) || 0,
			// 		};
			// 	}
			// }
		],
		toDOM: (node) => {
			return [
				'span',
				{
					'data-node-type': 'footnote',
					'data-value': node.attrs.value,
					'date-structured-value': node.attrs.structuredValue,
					'date-structured-html': node.attrs.structuredHtml,
					'data-count': node.attrs.count,
					class: 'footnote',
				},
				String(node.attrs.count),
			];
		},
		inline: true,
		group: 'inline',
		// draggable: false,

		/* NodeView Options. These are not part of the standard Prosemirror Schema spec */
		// isNodeView: true,
		onInsert: (view, attrs) => {
			const footnoteNode = view.state.schema.nodes.footnote.create(attrs);
			const transaction = view.state.tr.replaceSelectionWith(footnoteNode);
			view.dispatch(transaction);
		},
		defaultOptions: {},
		// toStatic: (node, options, isSelected, isEditable, editorProps /* children */) => {
		// 	return (
		// 		<Footnote
		// 			key={node.currIndex}
		// 			attrs={node.attrs}
		// 			options={options}
		// 			isSelected={isSelected}
		// 			isEditable={isEditable}
		// 			editorProps={editorProps || undefined} /* We || undefined because editorProps can be null which doesn't trigger defaultProps */
		// 		/>
		// 	);
		// },
	},
	// footnoteList: {
	// 	atom: true,
	// 	attrs: {
	// 		listItems: {
	// 			default: [],
	// 		} /* An array of objects with the form { value: footnoteValue }  */,
	// 	},
	// 	parseDOM: [{ tag: 'footnotelist' }],
	// 	toDOM: () => {
	// 		return ['footnotelist'];
	// 	},
	// 	inline: false,
	// 	group: 'block',
	// 	draggable: false,

	// 	/* NodeView Options. These are not part of the standard Prosemirror Schema spec */
	// 	isNodeView: true,
	// 	onInsert: (view, attrs) => {
	// 		const footnoteListNode = view.state.schema.nodes.footnoteList.create(attrs);
	// 		const transaction = view.state.tr.replaceSelectionWith(footnoteListNode);
	// 		view.dispatch(transaction);
	// 	},
	// 	defaultOptions: {},
	// 	toStatic: (node, options, isSelected, isEditable /* editorProps, children */) => {
	// 		return (
	// 			<FootnoteList
	// 				key={node.currIndex}
	// 				attrs={node.attrs}
	// 				options={options}
	// 				isSelected={isSelected}
	// 				isEditable={isEditable}
	// 			/>
	// 		);
	// 	},
	// },
};
