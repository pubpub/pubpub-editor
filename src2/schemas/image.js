import React from 'react';
import Image from '../components/Image/Image';

export default {
	image: {
		atom: true,
		attrs: {
			url: { default: null },
			size: { default: 50 }, // number as percentage
			align: { default: 'center' },
			caption: { default: '' },
		},
		parseDOM: [{
			tag: 'img',
			getAttrs: (node)=> {
				return {
					url: node.getAttribute('src') || null,
					size: Number(node.getAttribute('data-size')) || 50,
					align: node.getAttribute('data-align') || 'center',
					caption: node.getAttribute('alt') || '',
				};
			}
		}],
		toDOM: (node)=> {
			return ['img', {
				src: node.attrs.url,
				'data-size': node.attrs.size,
				'data-align': node.attrs.align,
				alt: node.attrs.caption,
			}];
		},
		inline: false,
		group: 'block',
		draggable: true,
		insertMenu: { // TODO: probably replace this with just onInsert(). icon and label should not be determined by library.
			label: 'Image',
			icon: 'pt-icon-media',
			onInsert: (view) => {
				const imageNode = view.state.schema.nodes.image.create();
				const transaction = view.state.tr.replaceSelectionWith(imageNode);
				view.dispatch(transaction);
			},
		},
		isNodeView: true,
		defaultOptions: {
			onResizeUrl: (url)=> { return url; },
			linkToSrc: true,
		},
		toStatic: (node, options, isSelected, isEditable, /* editorProps, children */)=> {
			return (
				<Image
					key={node.currIndex}
					attrs={node.attrs}
					options={options}
					isSelected={isSelected}
					isEditable={isEditable}
				/>
			);
		}
	}
};
