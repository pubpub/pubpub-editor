import React from 'react';
import HighlightQuote from '../components/HighlightQuote/HighlightQuote';

export default {
	highlightQuote: {
		atom: true,
		attrs: {
			to: { default: null },
			from: { default: null },
			id: { default: null },
			exact: { default: null },
			suffix: { default: null },
			prefix: { default: null },
			version: { default: null },
			section: { default: null },
		},
		parseDOM: [
			{
				tag: 'highlightquote',
				getAttrs: (node) => {
					return {
						to: node.getAttribute('data-to') || null,
						from: node.getAttribute('data-from') || null,
						id: node.getAttribute('data-id') || null,
						exact: node.getAttribute('data-exact') || null,
						suffix: node.getAttribute('data-suffix') || null,
						prefix: node.getAttribute('data-prefix') || null,
						version: node.getAttribute('data-version') || null,
						section: node.getAttribute('data-section') || null,
					};
				},
			},
		],
		toDOM: (node) => {
			return [
				'highlightquote',
				{
					'data-to': node.attrs.to,
					'data-from': node.attrs.from,
					'data-id': node.attrs.id,
					'data-exact': node.attrs.exact,
					'data-suffix': node.attrs.suffix,
					'data-prefix': node.attrs.prefix,
					'data-version': node.attrs.version,
					'data-section': node.attrs.section,
				},
			];
		},
		inline: false,
		group: 'block',
		draggable: true,

		/* NodeView Options. These are not part of the standard Prosemirror Schema spec */
		isNodeView: true,
		onInsert: undefined,
		defaultOptions: {},
		toStatic: (node, options, isSelected, isEditable /* editorProps, children */) => {
			return (
				<HighlightQuote
					key={node.currIndex}
					attrs={node.attrs}
					options={options}
					isSelected={isSelected}
					isEditable={isEditable}
				/>
			);
		},
	},
};
