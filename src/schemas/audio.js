// import React from 'react';
// import Audio from '../components/Audio/Audio';
import { renderHtmlChildren } from '../utils/schemaUtils';

export default {
	audio: {
		atom: true,
		attrs: {
			url: { default: null },
			size: { default: 50 }, // number as percentage
			align: { default: 'center' },
			caption: { default: '' },
		},
		parseDOM: [
			{
				tag: 'figure',
				getAttrs: (node) => {
					if (node.getAttribute('data-node-type') !== 'audio') {
						return false;
					}
					return {
						url: node.firstChild.getAttribute('src') || null,
						size: Number(node.getAttribute('data-size')) || 50,
						align: node.getAttribute('data-align') || 'center',
						caption: node.firstChild.getAttribute('alt') || '',
					};
				},
			},
		],
		toDOM: (node) => {
			return [
				'figure',
				{
					'data-node-type': 'audio',
					'data-size': node.attrs.size,
					'data-align': node.attrs.align,
				},
				[
					'audio',
					{
						controls: true,
						preload: 'metadata',
						src: node.attrs.url,
						alt: node.attrs.caption,
					},
				],
				['figcaption', {}, renderHtmlChildren(node, node.attrs.caption)],
			];
		},
		inline: false,
		group: 'block',
		// draggable: false,

		/* NodeView Options. These are not part of the standard Prosemirror Schema spec */
		// isNodeView: true,
		onInsert: (view, attrs) => {
			const audioNode = view.state.schema.nodes.audio.create(attrs);
			const transaction = view.state.tr.replaceSelectionWith(audioNode);
			view.dispatch(transaction);
		},
		defaultOptions: {},
		// toStatic: (node, options, isSelected, isEditable /* editorProps, children */) => {
		// 	return (
		// 		<Audio
		// 			key={node.currIndex}
		// 			attrs={node.attrs}
		// 			options={options}
		// 			isSelected={isSelected}
		// 			isEditable={isEditable}
		// 		/>
		// 	);
		// },
	},
};
