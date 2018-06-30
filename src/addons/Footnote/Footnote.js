import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Plugin } from 'prosemirror-state';
import FootnoteEditable from './FootnoteEditable';
import FootnoteStatic from './FootnoteStatic';

const propTypes = {
	onOptionsRender: PropTypes.func,
	optionsContainerRef: PropTypes.object,
};
const defaultProps = {
	onOptionsRender: ()=>{},
	optionsContainerRef: {},
};

/**
* @module Addons
*/

/**
* @component
*
* Enable footnotes in your document
*
* @example
return (
	<Editor>
		<Footnote />
	</Editor>
);
*/
class Footnote extends Component {
	static schema = (props)=> {
		return {
			nodes: {
				footnote: {
					atom: true,
					group: 'inline',
					attrs: {
						value: { default: '' },
						count: { default: 0 },
					},
					parseDOM: [
						{
							tag: 'footnote',
							getAttrs: (node)=> {
								return {
									value: node.getAttribute('data-value') || '',
									count: Number(node.getAttribute('data-count')) || 0,
								};
							}
						},
						// {
						// 	style: 'mso-special-character',
						// 	priority: 60,
						// 	getAttrs: (node)=> {
						// 		console.log('node', node);
						// 		return {
						// 			value: 'wppr' || node.getAttribute('data-value') || '',
						// 			count: 99 || Number(node.getAttribute('data-count')) || 0,
						// 		};
						// 	}
						// }
					],
					toDOM: (node)=> {
						return ['footnote', {
							'data-value': node.attrs.value,
							'data-count': node.attrs.count,
						}];
					},
					inline: true,
					draggable: false,
					selectable: true,
					insertMenu: {
						label: 'Footnote',
						icon: 'pt-icon-asterisk',
						onInsert: (view) => {
							const newNode = view.state.schema.nodes.footnote.create();
							view.dispatch(view.state.tr.replaceSelectionWith(newNode));
						},
					},
					toEditable(node, view, decorations, isSelected, helperFunctions) {
						return (
							<FootnoteEditable
								value={node.attrs.value}
								count={node.attrs.count}
								isSelected={isSelected}
								view={view}
								{...helperFunctions}
								onOptionsRender={props.onOptionsRender}
								optionsContainerRef={props.optionsContainerRef}
							/>
						);
					},
					toStatic(node) {
						return (
							<FootnoteStatic
								key={node.currIndex}
								value={node.attrs.value}
								count={node.attrs.count}
							/>
						);
					},
				},
			}
		};
	};

	static pluginName = 'Footnote';

	static getPlugins({ pluginKey }) {
		return [new Plugin({
			key: pluginKey,
			appendTransaction: (transactions, oldState, newState)=> {
				let footnoteCount = 1;
				let didUpdate = false;
				const newTransaction = newState.tr;
				newState.doc.nodesBetween(
					0,
					newState.doc.nodeSize - 2,
					(node, nodePos)=> {
						if (node.type.name === 'footnote') {
							if (node.attrs.count !== footnoteCount) {
								didUpdate = true;
								newTransaction.setNodeMarkup(
									nodePos,
									null,
									{ ...node.attrs, count: footnoteCount }
								);
								newTransaction.setMeta('footnote', true);
							}
							footnoteCount += 1;
						}
						return true;
					}
				);
				return didUpdate ? newTransaction : null;
			}
		})];
	}

	render() {
		return null;
	}
}

Footnote.propTypes = propTypes;
Footnote.defaultProps = defaultProps;
export default Footnote;
