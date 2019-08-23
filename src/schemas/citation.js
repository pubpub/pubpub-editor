export default {
	citation: {
		atom: true,
		attrs: {
			value: { default: '' },
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
						unstructuredValue: node.getAttribute('data-unstructured-value') || '',
						count: Number(node.getAttribute('data-count')) || undefined,
					};
				},
			},
		],
		toDOM: (node) => {
			const inlineRenderFunc = node.type.spec.defaultOptions.inlineRenderer;
			return [
				'span',
				{
					'data-node-type': 'citation',
					'data-value': node.attrs.value,
					'data-unstructured-value': node.attrs.unstructuredValue,
					'data-count': node.attrs.count,
					class: 'citation',
				},
				inlineRenderFunc(node.attrs.count),
			];
		},
		inline: true,
		group: 'inline',

		/* These are not part of the standard Prosemirror Schema spec */
		onInsert: (view, attrs) => {
			const citationNode = view.state.schema.nodes.citation.create(attrs);
			const transaction = view.state.tr.replaceSelectionWith(citationNode);
			view.dispatch(transaction);
		},
		defaultOptions: {
			inlineRenderer: (count) => {
				return `[${count}]`;
			},
		},
	},
};
