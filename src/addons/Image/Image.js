import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImageEditable from './ImageEditable';
import ImageStatic from './ImageStatic';

const propTypes = {
	handleFileUpload: PropTypes.func,
	handleResizeUrl: PropTypes.func, // Should take a url and return a url to a resized image
	linkToSrc: PropTypes.bool,
};
const defaultProps = {
	handleFileUpload: ()=>{},
	handleResizeUrl: undefined,
	linkToSrc: false,
};

/**
* @module Addons
*/

/**
* @component
*
* Embed images in your document. Supports .jpeg, .png, and .gif
*
* @prop {function} handleFileUpload(file,onProgressCallback,onFinishCallback,index) A function that uploads the given file and is expected to call onFinishCallback with a new URL where the file is accessible.
* @prop {function} handleResizeUrl(url) A function that takes a URL and returns a new URL that will be rendered. Allows you to use a resizing service.
*
* @example
return (
	<Editor>
 		<Image
 			handleFileUpload={myUploadFunc}
 			handleResizeUrl={myResizeFunc}
 		/>
	</Editor>
);
*/
class Image extends Component {
	static schema = (props)=> {
		return {
			nodes: {
				image: {
					atom: true,
					// content: 'inline*',
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
					draggable: false,
					selectable: true,
					insertMenu: {
						label: 'Insert Image',
						icon: 'pt-icon-media',
						onInsert: (view) => {
							const imageNode = view.state.schema.nodes.image.create();
							const transaction = view.state.tr.replaceSelectionWith(imageNode);
							view.dispatch(transaction);
						},
					},
					toEditable(node, view, decorations, isSelected, helperFunctions) {
						return (
							<ImageEditable
								node={node}
								caption={node.attrs.caption}
								url={node.attrs.url}
								align={node.attrs.align}
								size={node.attrs.size}
								isSelected={isSelected}
								view={view}
								{...helperFunctions}
								onFileUpload={props.handleFileUpload}
								handleResizeUrl={props.handleResizeUrl}
							/>
						);
					},
					toStatic(node) {
						return (
							<ImageStatic
								key={node.currIndex}
								align={node.attrs.align}
								url={node.attrs.url}
								size={node.attrs.size}
								caption={node.attrs.caption}
								handleResizeUrl={props.handleResizeUrl}
								linkToSrc={props.linkToSrc}
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

Image.propTypes = propTypes;
Image.defaultProps = defaultProps;
export default Image;
