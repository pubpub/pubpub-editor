import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Plugin } from 'prosemirror-state';
import FootnoteEditable from './FootnoteEditable';
import FootnoteStatic from './FootnoteStatic';
import FootnoteList from './FootnoteList';

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
				footnoteList: {
					atom: true,
					attrs: {
						listItems: { default: [] } /* An array of objects with the form { value: footnoteValue }  */
					},
					parseDOM: [{ tag: 'footnoteList' }],
					toDOM: ()=> {
						return ['footnoteList'];
					},
					inline: false,
					group: 'block',
					draggable: false,
					selectable: true,
					insertMenu: {
						label: 'Footnote List',
						icon: 'pt-icon-numbered-list',
						onInsert: (view) => {
							const footnoteListNode = view.state.schema.nodes.footnoteList.create();
							const transaction = view.state.tr.replaceSelectionWith(footnoteListNode);
							view.dispatch(transaction);
						},
					},
					toEditable(node, view, decorations, isSelected) {
						return (
							<FootnoteList
								key={node.attrs.key}
								isSelected={isSelected}
								listItems={node.attrs.listItems}
							/>
						);
					},
					toStatic(node) {
						return (
							<FootnoteList
								key={node.currIndex}
								listItems={node.attrs.listItems}
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
				const footnoteItems = [];
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
							footnoteItems.push({ value: node.attrs.value, count: footnoteCount });
							footnoteCount += 1;
						}
						return true;
					}
				);

				/* Check all FootnoteList nodes to make sure they are updated if */
				/* didUpdate is true, or if the list is empty, but counts is not */
				newState.doc.nodesBetween(
					0,
					newState.doc.nodeSize - 2,
					(node, nodePos)=> {
						if (node.type.name === 'footnoteList') {
							/* Test whether the values of the footnote list should be */
							/* updated due to new value in individual footnotes */
							const footnoteContentChanged = footnoteItems.reduce((prev, curr, index)=> {
								const prevFootnoteData = node.attrs.listItems[index] || {};
								if (prevFootnoteData.value !== curr.value) {
									return true;
								}
								return prev;
							}, false);

							if (node.attrs.listItems.length !== footnoteItems.length || didUpdate || footnoteContentChanged) {
								didUpdate = true;
								newTransaction.setNodeMarkup(
									nodePos,
									null,
									{ ...node.attrs, listItems: footnoteItems }
								);
								newTransaction.setMeta('footnote', true);
							}
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
