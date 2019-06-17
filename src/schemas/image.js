import React from 'react';
import Image from '../components/Image/Image';
import breakout from './partials/breakout';

export default {
	image: {
		atom: true,
		attrs: {
			url: { default: null },
			size: { default: 50 }, // number as percentage
			align: { default: 'center' },
			caption: { default: '' },
			breakout: { default: false },
		},
		parseDOM: [
			{
				tag: 'img',
				getAttrs: (node) => {
					return {
						url: node.getAttribute('src') || null,
						size: Number(node.getAttribute('data-size')) || 50,
						align: node.getAttribute('data-align') || 'center',
						caption: node.getAttribute('alt') || '',
					};
				},
			},
		],
		toDOM: (node) => {
			return [
				'img',
				{
					src: node.attrs.url,
					'data-size': node.attrs.size,
					'data-align': node.attrs.align,
					alt: node.attrs.caption,
				},
			];
		},
		inline: false,
		group: 'block',
		draggable: true,

		/* NodeView Options. These are not part of the standard Prosemirror Schema spec */
		isNodeView: true,
		onInsert: (view, attrs) => {
			const imageNode = view.state.schema.nodes.image.create(attrs);
			const transaction = view.state.tr.replaceSelectionWith(imageNode);
			view.dispatch(transaction);
		},
		defaultOptions: {
			onResizeUrl: (url) => {
				return url;
			},
			linkToSrc: true,
		},
		toStatic: (node, options, isSelected, isEditable /* editorProps, children */) => {
			return (
				<div data-align-breakout={node.attrs.breakout} key={node.currIndex}>
					<Image
						attrs={node.attrs}
						options={options}
						isSelected={isSelected}
						isEditable={isEditable}
					/>
				</div>
			);
		},
		processContainerElement: (node, element) => {
			breakout(node, element);
		},
	},
};
