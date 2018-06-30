import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Plugin } from 'prosemirror-state';
import CitationEditable from './CitationEditable';
import CitationStatic from './CitationStatic';
import CitationList from './CitationList';

const propTypes = {
	formatFunction: PropTypes.func,
	onOptionsRender: PropTypes.func,
	optionsContainerRef: PropTypes.object,
};

const defaultProps = {
	formatFunction: (item, callback)=> { callback(`html:${item}`); },
	onOptionsRender: ()=>{},
	optionsContainerRef: {},
};

/**
* @module Addons
*/

/**
* @component
*
* Adds Citation and CitationList to the document schema. Citation embeds a single citation item in your document. CitationList will produce a list of all used citations in the order they appear in the document.
*
* @prop {function} formatFunction(item,callback) A function that converts item (a string) into formatted properly formatted HTML.
*
* @example
return (
	<Editor>
		<Citation formatFunction={myFormatFunc} />
	</Editor>
);
*/
class Citation extends Component {
	static schema = (props)=> {
		return {
			nodes: {
				citation: {
					atom: true,
					group: 'inline',
					attrs: {
						value: { default: '' },
						html: { default: '' },
						count: { default: 0 },
					},
					parseDOM: [{
						tag: 'citation',
						getAttrs: (node)=> {
							return {
								value: node.getAttribute('data-value') || '',
								html: node.getAttribute('data-html') || '',
								count: Number(node.getAttribute('data-count')) || undefined,
							};
						}
					}],
					toDOM: (node)=> {
						return ['citation', {
							'data-value': node.attrs.value,
							'data-html': node.attrs.html,
							'data-count': node.attrs.count
						}];
					},
					inline: true,
					draggable: false,
					selectable: true,
					insertMenu: {
						label: 'Citation',
						icon: 'pt-icon-bookmark',
						onInsert: (view) => {
							const newNode = view.state.schema.nodes.citation.create();
							view.dispatch(view.state.tr.replaceSelectionWith(newNode));
						},
					},
					toEditable(node, view, decorations, isSelected, helperFunctions) {
						return (
							<CitationEditable
								value={node.attrs.value}
								html={node.attrs.html}
								count={node.attrs.count}
								isSelected={isSelected}
								view={view}
								formatFunction={props.formatFunction}
								{...helperFunctions}
								onOptionsRender={props.onOptionsRender}
								optionsContainerRef={props.optionsContainerRef}
							/>
						);
					},
					toStatic(node) {
						return (
							<CitationStatic
								key={node.currIndex}
								value={node.attrs.value}
								html={node.attrs.html}
								count={node.attrs.count}
							/>
						);
					},
				},
				citationList: {
					atom: true,
					attrs: {
						listItems: { default: [] } /* An array of objects with the form { value: citationValue, html: citationHtml }  */
					},
					parseDOM: [{ tag: 'citationlist' }],
					toDOM: ()=> {
						return ['citationlist'];
					},
					inline: false,
					group: 'block',
					draggable: false,
					selectable: true,
					insertMenu: {
						label: 'Citation List',
						icon: 'pt-icon-numbered-list',
						onInsert: (view) => {
							const citationListNode = view.state.schema.nodes.citationList.create();
							const transaction = view.state.tr.replaceSelectionWith(citationListNode);
							view.dispatch(transaction);
						},
					},
					toEditable(node, view, decorations, isSelected) {
						return (
							<CitationList
								key={node.attrs.key}
								isSelected={isSelected}
								listItems={node.attrs.listItems}
							/>
						);
					},
					toStatic(node) {
						return (
							<CitationList
								key={node.currIndex}
								listItems={node.attrs.listItems}
							/>
						);
					},
				},
			}
		};
	};

	static pluginName = 'Citation';
	static getPlugins({ pluginKey }) {
		return [new Plugin({
			key: pluginKey,
			appendTransaction: (transactions, oldState, newState)=> {
				const counts = {}; /* counts is an object with items of the following form. { citationHtml: { count: citationCount, value: citationValue } } */
				let didUpdate = false;
				const newTransaction = newState.tr;
				newState.doc.nodesBetween(
					0,
					newState.doc.nodeSize - 2,
					(node, nodePos)=> {
						if (node.type.name === 'citation') {
							const existingCount = counts[node.attrs.html] && counts[node.attrs.html].count;
							const nextCount = Object.keys(counts).length + 1;
							if (existingCount && node.attrs.count !== existingCount) {
								/* If we already have a number for this citation, but */
								/* the current node doesn't have that number, then update. */
								didUpdate = true;
								newTransaction.setNodeMarkup(
									nodePos,
									null,
									{ ...node.attrs, count: existingCount }
								);
								newTransaction.setMeta('citation', true);
							}
							if (!existingCount && node.attrs.count !== nextCount) {
								/* If we don't have a number for this citation and */
								/* the current node doesn't have that the right */ 
								/* nextNumber, then update. */
								didUpdate = true;
								newTransaction.setNodeMarkup(
									nodePos,
									null,
									{ ...node.attrs, count: nextCount }
								);
								newTransaction.setMeta('citation', true);
							}
							if (!existingCount) {
								counts[node.attrs.html] = { 
									count: nextCount,
									value: node.attrs.value,
								};
							}
						}
						return true;
					}
				);

				/* Check all CitationList nodes to make sure they are updated if */
				/* didUpdate is true, or if the list is empty, but counts is not */
				newState.doc.nodesBetween(
					0,
					newState.doc.nodeSize - 2,
					(node, nodePos)=> {
						if (node.type.name === 'citationList') {
							/* Test whether the html content of the citation list should be */
							/* updated due to new html in individual citations */
							const citationListContentChanged = Object.keys(counts).reduce((prev, curr)=> {
								const currCitationData = counts[curr];
								const prevCitationData = node.attrs.listItems[currCitationData.count] || {};
								if (prevCitationData.html !== curr) {
									return true;
								}
								return prev;
							}, false);

							if (node.attrs.listItems.length !== Object.keys(counts).length || didUpdate || citationListContentChanged) {
								const listItems = Object.keys(counts).sort((foo, bar)=> {
									if (counts[foo].count < counts[bar].count) { return -1; }
									if (counts[foo].count > counts[bar].count) { return 1; }
									return 0
								}).map((key)=> {
									return { html: key, value: counts[key].value, count: counts[key].count };
								});

								didUpdate = true;
								newTransaction.setNodeMarkup(
									nodePos,
									null,
									{ ...node.attrs, listItems: listItems }
								);
								newTransaction.setMeta('citation', true);
							}
						}
						return true;
					}
				);
				if (didUpdate) {
					/* Numbers being updated when html changes causes the node to lose focus. */
					/* This refocuses the node */
					newTransaction.setSelection(newState.selection);
				}
				return didUpdate ? newTransaction : null;
			}
		})];
	}

	render() {
		return null;
	}
}

Citation.propTypes = propTypes;
Citation.defaultProps = defaultProps;
export default Citation;
