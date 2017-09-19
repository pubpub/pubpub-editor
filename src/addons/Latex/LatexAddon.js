import React, { Component } from 'react';
// import PropTypes from 'prop-types';
import LatexEditable from './LatexEditable';
import LatexStatic from './LatexStatic';

/* 
All addons get the following props, 
but certain schema-based addons may not need them
*/

// const propTypes = {
// 	containerId: PropTypes.string.isRequired,
// 	view: PropTypes.object.isRequired,
// 	editorState: PropTypes.object.isRequired,
// };

class LatexAddon extends Component {
	static fish = 12;
	static schema = ()=> {
		return {
			nodes: {
				equation: {
					atom: true,
					group: 'inline',
					content: 'inline<_>*',
					attrs: {
						content: { default: '' },
					},
					inline: true,
					insertMenu: {
						label: 'Insert Latex',
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
							<LatexEditable
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
						return <LatexStatic value={equationText} block={false} />;
					},
				},


				block_equation: {
					atom: true,
					group: 'block',
					content: 'inline<_>*',
					attrs: {
						content: { default: '' },
					},
					toEditable(node, view, decorations, isSelected, helperFunctions) {
						let equationText;
						if (node.content && node.content.length >= 1) {
							equationText = node.content[0].text;
						} else if (node.attrs.content) {
							equationText = node.attrs.content;
						}
						return (
							<LatexEditable
								value={equationText}
								isBlock={true}
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
						return <LatexStatic value={equationText} block={true} />;
					}
				},
			}
		};
	};

	render() {
		return null;
	}
}

// LatexAddon.propTypes = propTypes;
export default LatexAddon;
