import React from 'react';
import Audio from '../components/Audio/Audio';

export default {
	audio: {
		atom: true,
		attrs: {
			url: { default: null },
			size: { default: 50 }, // number as percentage
			align: { default: 'center' },
			caption: { default: '' },
		},
		parseDOM: [{
			tag: 'audio',
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
			return ['audio', {
				src: node.attrs.url,
				'data-size': node.attrs.size,
				'data-align': node.attrs.align,
				alt: node.attrs.caption,
			}];
		},
		inline: false,
		group: 'block',
		draggable: false,

		/* NodeView Options. These are not part of the standard Prosemirror Schema spec */
		isNodeView: true,
		onInsert: (view, attrs)=> {
			const audioNode = view.state.schema.nodes.audio.create(attrs);
			const transaction = view.state.tr.replaceSelectionWith(audioNode);
			view.dispatch(transaction);
		},
		defaultOptions: {},
		toStatic: (node, options, isSelected, isEditable, /* editorProps, children */)=> {
			return (
				<Audio
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
