import React, { Component } from 'react';
import PropTypes from 'prop-types';
import FileEditable from './FileEditable';
import FileStatic from './FileStatic';

const propTypes = {
	handleFileUpload: PropTypes.func,
};
const defaultProps = {
	handleFileUpload: ()=>{},
};

/**
* @module Addons
*/

/**
* @component
*
* Embed files in your document. Supports any file type.
*
* @prop {function} handleFileUpload(file,onProgressCallback,onFinishCallback,index) A function that uploads the given file and is expected to call onFinishCallback with a new URL where the file is accessible.
*
* @example
return (
	<Editor>
		<File handleFileUpload={myUploadFunc} />
	</Editor>
);
*/
class File extends Component {
	static schema = (props)=> {
		return {
			nodes: {
				file: {
					atom: true,
					attrs: {
						url: { default: null },
						fileName: { default: null },
						fileSize: { default: null },
						caption: { default: '' },
					},
					parseDOM: [{
						tag: 'file',
						getAttrs: (node)=> {
							return {
								url: node.getAttribute('data-url') || null,
								fileName: node.getAttribute('data-fileName') || null,
								fileSize: Number(node.getAttribute('data-fileSize')) || null,
								caption: Number(node.getAttribute('data-caption')) || '',
							};
						}
					}],
					toDOM: (node)=> {
						return ['file', {
							'data-url': node.attrs.url,
							'data-fileName': node.attrs.fileName,
							'data-fileSize': node.attrs.fileSize,
							'data-caption': node.attrs.caption,
						}];
					},
					inline: false,
					group: 'block',
					draggable: false,
					selectable: true,
					insertMenu: {
						label: 'File',
						icon: 'pt-icon-document',
						onInsert: (view) => {
							const fileNode = view.state.schema.nodes.file.create();
							const transaction = view.state.tr.replaceSelectionWith(fileNode);
							view.dispatch(transaction);
						},
					},
					toEditable(node, view, decorations, isSelected, helperFunctions) {
						return (
							<FileEditable
								node={node}
								url={node.attrs.url}
								fileName={node.attrs.fileName}
								fileSize={node.attrs.fileSize}
								caption={node.attrs.caption}
								isSelected={isSelected}
								view={view}
								{...helperFunctions}
								onFileUpload={props.handleFileUpload}
							/>
						);
					},
					toStatic(node) {
						return (
							<FileStatic
								key={node.currIndex}
								url={node.attrs.url}
								fileName={node.attrs.fileName}
								fileSize={node.attrs.fileSize}
								caption={node.attrs.caption}
							/>
						);
					},
				},
			}
		};
	};

	render() {
		return null;
	}
}

File.propTypes = propTypes;
File.defaultProps = defaultProps;
export default File;
