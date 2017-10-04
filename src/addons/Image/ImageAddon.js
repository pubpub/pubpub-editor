import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImageEditable from './ImageEditable';
import ImageStatic from './ImageStatic';

const propTypes = {
	handleFileUpload: PropTypes.func,

	/* All addons get the following props,
	but certain schema-based addons may not need them */
	// containerId: PropTypes.string.isRequired,
	// view: PropTypes.object.isRequired,
	// editorState: PropTypes.object.isRequired,
};
const defaultProps = {
	handleFileUpload: ()=>{},
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
					parseDOM: [{ tag: 'img[src]' }],
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
