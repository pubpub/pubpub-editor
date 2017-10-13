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
	static schema = ()=> {
		return {
			nodes: {
				equation: {
					atom: true,
					group: 'inline',
					content: 'inline*',
					attrs: {
						value: { default: '' },
					},
					inline: true,
					draggable: false,
					selectable: true,
					insertMenu: {
						label: 'Insert Latex Math',
						icon: 'pt-icon-function',
						onInsert: (view) => {
							const newNode = view.state.schema.nodes.equation.create({ value: '\\sum_ix^i' });
							view.dispatch(view.state.tr.replaceSelectionWith(newNode));
						},
					},
					toEditable(node, view, decorations, isSelected, helperFunctions) {
						return (
							<LatexEditable
								value={node.attrs.value}
								isBlock={false}
								isSelected={isSelected}
								view={view}
								{...helperFunctions}
							/>
						);
					},
					toStatic(node) {
						return <LatexStatic value={node.attrs.value} isBlock={false} />;
					},
				},


				block_equation: {
					atom: true,
					group: 'block',
					content: 'inline*',
					draggable: false,
					selectable: true,
					attrs: {
						value: { default: '' },
					},
					toEditable(node, view, decorations, isSelected, helperFunctions) {
						return (
							<LatexEditable
								value={node.attrs.value}
								isBlock={true}
								isSelected={isSelected}
								view={view}
								{...helperFunctions}
							/>
						);
					},
					toStatic(node) {
						return <LatexStatic value={node.attrs.value} isBlock={true} />;
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
