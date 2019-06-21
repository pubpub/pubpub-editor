import React from 'react';
import Video from '../components/Video/Video';

export default {
	video: {
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
				tag: 'video',
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
				'video',
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
		draggable: false,

		/* NodeView Options. These are not part of the standard Prosemirror Schema spec */
		isNodeView: true,
		onInsert: (view, attrs) => {
			const videoNode = view.state.schema.nodes.video.create(attrs);
			const transaction = view.state.tr.replaceSelectionWith(videoNode);
			view.dispatch(transaction);
		},
		defaultOptions: {},
		toStatic: (node, options, isSelected, isEditable /* editorProps, children */) => {
			return (
				<div data-align-breakout={node.attrs.breakout} key={node.currIndex}>
					<Video
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
