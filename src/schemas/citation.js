// import React from 'react';
// import Citation from '../components/Citation/Citation';
// import CitationList from '../components/CitationList/CitationList';

export default {
	citation: {
		atom: true,
		attrs: {
			value: { default: '' },
			html: { default: '' },
			unstructuredValue: { default: '' },
			count: { default: 0 },
		},
		parseDOM: [
			{
				tag: 'span',
				getAttrs: (node) => {
					if (node.getAttribute('data-node-type') !== 'citation') {
						return false;
					}
					return {
						value: node.getAttribute('data-value') || '',
						html: node.getAttribute('data-html') || '',
						unstructuredValue: node.getAttribute('data-unstructured-value') || '',
						count: Number(node.getAttribute('data-count')) || undefined,
					};
				},
			},
		],
		toDOM: (node) => {
			return [
				'span',
				{
					'data-node-type': 'citation',
					'data-value': node.attrs.value,
					'data-html': node.attrs.html,
					'data-unstructured-value': node.attrs.unstructuredValue,
					'data-count': node.attrs.count,
					class: 'citation',
				},
				String(node.attrs.count),
			];
		},
		// toDOM: (node) => {
		// 	return [
		// 		'citation',
		// 		{
		// 			'data-value': node.attrs.value,
		// 			'data-html': node.attrs.html,
		// 			'data-unstructured-value': node.attrs.unstructuredValue,
		// 			'data-count': node.attrs.count,
		// 		},
		// 	];
		// },
		inline: true,
		group: 'inline',
		// draggable: false,

		/* NodeView Options. These are not part of the standard Prosemirror Schema spec */
		// isNodeView: true,
		onInsert: (view, attrs) => {
			const citationNode = view.state.schema.nodes.citation.create(attrs);
			const transaction = view.state.tr.replaceSelectionWith(citationNode);
			view.dispatch(transaction);
		},
		defaultOptions: {},
		// toStatic: (node, options, isSelected, isEditable, editorProps /* children */) => {
		// 	return (
		// 		<Citation
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
	// citationList: {
	// 	atom: true,
	// 	attrs: {
	// 		listItems: {
	// 			default: [],
	// 		} /* An array of objects with the form { value: citationValue, html: citationHtml }  */,
	// 	},
	// 	parseDOM: [{ tag: 'citationlist' }],
	// 	toDOM: () => {
	// 		return ['citationlist'];
	// 	},
	// 	inline: false,
	// 	group: 'block',
	// 	draggable: false,

	// 	/* NodeView Options. These are not part of the standard Prosemirror Schema spec */
	// 	isNodeView: true,
	// 	onInsert: (view, attrs) => {
	// 		const citationListNode = view.state.schema.nodes.citationList.create(attrs);
	// 		const transaction = view.state.tr.replaceSelectionWith(citationListNode);
	// 		view.dispatch(transaction);
	// 	},
	// 	defaultOptions: {},
	// 	toStatic: (node, options, isSelected, isEditable /* editorProps, children */) => {
	// 		return (
	// 			<CitationList
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
