import React from 'react';
import File from '../components/File/File';

export default {
	file: {
		atom: true,
		attrs: {
			url: { default: null },
			fileName: { default: null },
			fileSize: { default: null },
			caption: { default: '' },
		},
		parseDOM: [
			{
				tag: 'file',
				getAttrs: (node) => {
					return {
						url: node.getAttribute('data-url') || null,
						fileName: node.getAttribute('data-fileName') || null,
						fileSize: Number(node.getAttribute('data-fileSize')) || null,
						caption: node.getAttribute('data-caption') || '',
					};
				},
			},
		],
		toDOM: (node) => {
			return [
				'file',
				{
					'data-url': node.attrs.url,
					'data-fileName': node.attrs.fileName,
					'data-fileSize': node.attrs.fileSize,
					'data-caption': node.attrs.caption,
				},
			];
		},
		inline: false,
		group: 'block',
		draggable: true,

		/* NodeView Options. These are not part of the standard Prosemirror Schema spec */
		isNodeView: true,
		onInsert: (view, attrs) => {
			const fileNode = view.state.schema.nodes.file.create(attrs);
			const transaction = view.state.tr.replaceSelectionWith(fileNode);
			view.dispatch(transaction);
		},
		defaultOptions: {},
		toStatic: (node, options, isSelected, isEditable /* editorProps, children */) => {
			return (
				<File
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
