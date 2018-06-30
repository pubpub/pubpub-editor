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
			view: function() {
				return {
					update: function(view) {
						let footnoteCount = 1;
						for (let nodeIndex = 0; nodeIndex < view.state.doc.nodeSize - 1; nodeIndex++) {
							const curr = view.state.doc.nodeAt(nodeIndex);
							if (curr && curr.type.name === 'footnote') {
								if (curr.attrs.count !== footnoteCount) {
									const transaction = view.state.tr.setNodeMarkup(
										nodeIndex,
										null,
										{
											...curr.attrs,
											count: footnoteCount
										}
									);
									transaction.setMeta('footnote', true);
									view.dispatch(transaction);
								}
								footnoteCount += 1;
							}
						}
					}
				};
			},
		})];
	}

	render() {
		return null;
	}
}

Footnote.propTypes = propTypes;
Footnote.defaultProps = defaultProps;
export default Footnote;
