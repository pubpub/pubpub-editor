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
	static fish = 12;
	static schema = ()=> {
		return {
			nodes: {
				image: {
					atom: true,
					group: 'inline',
					content: 'inline<_>*',
					attrs: {
						content: { default: '' },
					},
					inline: true,
					insertMenu: {
						label: 'Insert Image',
						icon: 'pt-equation',
						onInsert: (view) => {
							const newNode = view.state.schema.nodes.equation.create({ content: '\\sum_ix^i' });
							view.dispatch(view.state.tr.replaceSelectionWith(newNode));
						},
					},
					toEditable(node, view, decorations, isSelected, helperFunctions) {
						let equationText;
						if (node.content && node.content.length >= 1) {
							equationText = node.content[0].text;
						} else if (node.attrs.content) {
							equationText = node.attrs.content;
						}
						return (
							<ImageEditable
								value={equationText}
								isBlock={false}
								isSelected={isSelected}
								view={view}
								helperFunctions={helperFunctions}
							/>
						);
					},
					toStatic({ node }) {
						let equationText;
						if (node.content && node.content.length >= 1) {
							equationText = node.content[0].text;
						} else if (node.attrs.content) {
							equationText = node.attrs.content;
						}
						return <ImageStatic value={equationText} block={false} />;
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
