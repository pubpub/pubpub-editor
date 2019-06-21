import React from 'react';
import Iframe from '../components/Iframe/Iframe';

export default {
	iframe: {
		atom: true,
		attrs: {
			url: { default: '' },
			size: { default: 75 }, // number as percentage
			height: { default: 419 },
			align: { default: 'center' },
			caption: { default: '' },
			breakout: { default: false },
		},
		parseDOM: [
			{
				tag: 'iframe',
				getAttrs: (node) => {
					return {
						url: node.getAttribute('src') || '',
						size: Number(node.getAttribute('data-size')) || 75,
						height: Number(node.getAttribute('height')) || 419,
						align: node.getAttribute('data-align') || 'center',
						caption: node.getAttribute('alt') || '',
					};
				},
			},
		],
		toDOM: (node) => {
			return [
				'iframe',
				{
					src: node.attrs.url,
					'data-size': node.attrs.size,
					height: node.attrs.height,
					'data-align': node.attrs.align,
					alt: node.attrs.caption,
				},
			];
		},
		inline: false,
		group: 'block',
		draggable: false,

		/* NodeView Options. These are not part of the standard Prosemirror Schema spec */
		isNodeView: true,
		onInsert: (view, attrs) => {
			const iframeNode = view.state.schema.nodes.iframe.create(attrs);
			const transaction = view.state.tr.replaceSelectionWith(iframeNode);
			view.dispatch(transaction);
		},
		defaultOptions: {},
		toStatic: (node, options, isSelected, isEditable /* editorProps, children */) => {
			return (
				<div data-align-breakout={node.attrs.breakout} key={node.currIndex}>
					<Iframe
						attrs={node.attrs}
						options={options}
						isSelected={isSelected}
						isEditable={isEditable}
					/>
				</div>
			);
		},
	},
};
