import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Plugin } from 'prosemirror-state';
import CitationEditable from './CitationEditable';
import CitationStatic from './CitationStatic';
import CitationList from './CitationList';

const propTypes = {
	formatFunction: PropTypes.func
};

const defaultProps = {
	formatFunction: (item, callback)=> { callback(`html:${item}`); }
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
						label: 'Insert Citation',
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
						key: { default: Math.random() }
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
						label: 'Insert Citation List',
						icon: 'pt-icon-numbered-list',
						onInsert: (view) => {
							const citationListNode = view.state.schema.nodes.citationList.create();
							const transaction = view.state.tr.replaceSelectionWith(citationListNode);
							view.dispatch(transaction);
						},
					},
					toEditable(node, view, decorations, isSelected, helperFunctions) {
						return (
							<CitationList
								key={node.attrs.key}
								isSelected={isSelected}
								isEditable={true}
								view={view}
								{...helperFunctions}
							/>
						);
					},
					toStatic(node, view) {
						return (
							<CitationList
								key={node.currIndex}
								node={node}
								view={view}
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
			view: function() {
				return {
					update: function(view, prevState) {
						let citationCount = 1;
						const counts = {};
						let didUpdate = false;

						let oldCitations = '';
						for (let nodeIndex = 0; nodeIndex < prevState.doc.nodeSize - 1; nodeIndex++) {
							const curr = prevState.doc.nodeAt(nodeIndex);
							if (curr && curr.type.name === 'citation') {
								oldCitations += curr.attrs.html;
							}
						}

						let newCitations = '';
						for (let nodeIndex = 0; nodeIndex < view.state.doc.nodeSize - 1; nodeIndex++) {
							const curr = view.state.doc.nodeAt(nodeIndex);
							if (curr && curr.type.name === 'citation') {
								newCitations += curr.attrs.html;
								const currentCount = counts[curr.attrs.html]
									? counts[curr.attrs.html]
									: citationCount;
								if (curr.attrs.count !== currentCount) {
									const transaction = view.state.tr.setNodeMarkup(
										nodeIndex,
										null,
										{
											...curr.attrs,
											count: currentCount
										}
									);
									transaction.setMeta('citation', true);
									view.dispatch(transaction);
									didUpdate = true;
								}
								if (!counts[curr.attrs.html]) {
									counts[curr.attrs.html] = citationCount;
									citationCount += 1;
								}
							}
						}

						if (didUpdate || oldCitations !== newCitations) {
							// This is just to refresh any citation list to make sure it has up to date data.
							for (let nodeIndex = 0; nodeIndex < view.state.doc.nodeSize - 1; nodeIndex++) {
								const curr = view.state.doc.nodeAt(nodeIndex);
								if (curr && curr.type.name === 'citationList') {
									const transaction = view.state.tr.setNodeMarkup(
										nodeIndex,
										null,
										{
											...curr.attrs,
											key: Math.random(),
										}
									);
									transaction.setMeta('citation', true);
									view.dispatch(transaction);
								}
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

Citation.propTypes = propTypes;
Citation.defaultProps = defaultProps;
export default Citation;
