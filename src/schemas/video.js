// import React from 'react';
// import Video from '../components/Video/Video';
import { renderHtmlChildren, generateStyles } from '../utils/schemaUtils';

export default {
	video: {
		// atom: true,
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
					if (node.getAttribute('data-node-type') !== 'video') {
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
					'data-node-type': 'video',
					'data-size': node.attrs.size,
					'data-align': node.attrs.align,
				},
				[
					'video',
					{
						controls: true,
						preload: 'metadata',
						src: node.attrs.url,
						alt: node.attrs.caption,
						...generateStyles(node.attrs),
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
			const videoNode = view.state.schema.nodes.video.create(attrs);
			const transaction = view.state.tr.replaceSelectionWith(videoNode);
			view.dispatch(transaction);
		},
		defaultOptions: {},
		// toStatic: (node, options, isSelected, isEditable /* editorProps, children */) => {
		// 	const toDomSpec = [
		// 		'figure',
		// 		{},
		// 		[
		// 			'video',
		// 			{
		// 				controls: true,
		// 				preload: 'metadata',
		// 				src: node.attrs.url,
		// 				'data-size': node.attrs.size,
		// 				'data-align': node.attrs.align,
		// 				alt: node.attrs.caption,
		// 			},
		// 		],
		// 		['figcaption', {}, node.attrs.caption],
		// 	];
		// 	const createElems = (elem) => {
		// 		let attrs;
		// 		let children;
		// 		const hasAttrs =
		// 			elem[1] &&
		// 			typeof elem[1] === 'object' &&
		// 			!elem[1].nodeType &&
		// 			!Array.isArray(elem[1]);
		// 		if (hasAttrs) {
		// 			attrs = elem[1];
		// 		}

		// 		if (typeof elem[2] === 'string') {
		// 			children = elem[2];
		// 		} else {
		// 			const start = attrs ? 2 : 1;
		// 			const childArray = elem.slice(start, elem.length);
		// 			children = childArray.map((child) => {
		// 				return createElems(child);
		// 			});
		// 		}
		// 		return React.createElement(elem[0], elem[1], children);
		// 	};
		// 	return createElems(toDomSpec);
		// },
		// toStatic: (node, options, isSelected, isEditable /* editorProps, children */) => {
		// 	return (
		// 		<div data-align-breakout={node.attrs.breakout} key={node.currIndex}>
		// 			<Video
		// 				attrs={node.attrs}
		// 				options={options}
		// 				isSelected={isSelected}
		// 				isEditable={isEditable}
		// 			/>
		// 		</div>
		// 	);
		// },
	},
};
