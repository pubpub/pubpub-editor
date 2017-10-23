import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImageEditable from './ImageEditable';
import ImageStatic from './ImageStatic';

const propTypes = {
	handleFileUpload: PropTypes.func,
	handleResizeUrl: PropTypes.func, // Should take a url and return a url to a resized image
	/* All addons get the following props,
	but certain schema-based addons may not need them */
	// containerId: PropTypes.string.isRequired,
	// view: PropTypes.object.isRequired,
	// editorState: PropTypes.object.isRequired,
};
const defaultProps = {
	handleFileUpload: ()=>{},
	handleResizeUrl: undefined,
};

class ImageAddon extends Component {
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
						tag: 'img[src]',
						getAttrs: (node)=> {
							return {
								url: node.getAttribute('src'),
								caption: node.getAttribute('alt') || '',
								size: Number(node.getAttribute('data-size')) || undefined,
								align: node.getAttribute('data-align') || undefined,
							};
						}
					}],
					toDOM: (node)=> {
						return ['img', {
							src: node.attrs.url,
							alt: node.attrs.caption,
							'data-size': node.attrs.size,
							'data-align': node.attrs.align
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
								align={node.attrs.align}
								url={node.attrs.url}
								size={node.attrs.size}
								caption={node.attrs.caption}
								handleResizeUrl={props.handleResizeUrl}
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

ImageAddon.propTypes = propTypes;
ImageAddon.defaultProps = defaultProps;
export default ImageAddon;
