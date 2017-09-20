import React, { Component } from 'react';

// import PropTypes from 'prop-types';
import ImageEditable from './ImageEditable';
import ImageStatic from './ImageStatic';

/*
All addons get the following props,
but certain schema-based addons may not need them
*/

// const propTypes = {
// 	containerId: PropTypes.string.isRequired,
// 	view: PropTypes.object.isRequired,
// 	editorState: PropTypes.object.isRequired,
// };

class ImageAddon extends Component {
	static schema = ({ handleFileUpload })=> {
		console.log('handle files!', handleFileUpload);
		return {
			nodes: {
				image: {
					atom: true,
					content: 'caption?',
					attrs: {
						filename: { default: '' },
						url: { default: '' },
						figureName: { default: '' },
						size: { default: '' },
						align: { default: '' },
					},
					parseDOM: [{ tag: 'img[src]' }],
					inline: false,
					group: 'block',
					draggable: false,
					selectable: true,
					insertMenu: {
						label: 'Insert Image',
						icon: 'pt-equation',
						onInsert: (view) => {
							const textnode = view.state.schema.text('Enter caption.');
							const captionNode = view.state.schema.nodes.caption.create({}, textnode);
							const imageNode = view.state.schema.nodes.image.create(
								{
									url: "https://i.imgur.com/4jIx7oE.gif",
								},
								captionNode
							);
							let transaction = view.state.tr.replaceSelectionWith(imageNode);
							view.dispatch(transaction);
						},
					},
					toEditable(node, view, decorations, isSelected, helperFunctions) {
						return (
							<ImageEditable
								url={node.attrs.url}
								size={node.attrs.size}
								isSelected={isSelected}
								view={view}
								{...helperFunctions}
								handleFileUpload={handleFileUpload}
							/>
						);
					},
					toStatic({ node, index, renderContent }) {
						const filename = node.attrs.filename;
						const url = meta.fileMap[filename];
						return <ImageStatic key={index} {...node.attrs} url={url}>{renderContent(node.content, meta)}</ImageStatic>
					},
				},
			}
		};
	};

	render() {
		return null;
	}
}

// LatexAddon.propTypes = propTypes;
export default ImageAddon;
