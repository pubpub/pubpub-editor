import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Plugin } from 'prosemirror-state';
import CitationEditable from './CitationEditable';
import CitationStatic from './CitationStatic';
import CitationList from './CitationList';

/*
All addons get the following props,
but certain schema-based addons may not need them
*/

const propTypes = {
	formatFunction: PropTypes.func
// 	containerId: PropTypes.string.isRequired,
// 	view: PropTypes.object.isRequired,
// 	editorState: PropTypes.object.isRequired,
};

const defaultProps = {
	formatFunction: (item, callback)=> { callback(`html:${item}`); }
};

class CitationAddon extends Component {
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
					inline: false,
					group: 'block',
					draggable: false,
					selectable: true,
					insertMenu: {
						label: 'Insert Citation List',
						icon: 'pt-icon-media',
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

CitationAddon.propTypes = propTypes;
CitationAddon.defaultProps = defaultProps;
export default CitationAddon;
