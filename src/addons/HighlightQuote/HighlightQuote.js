import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Plugin } from 'prosemirror-state';
import { Slice, Fragment } from 'prosemirror-model';
import HighlightQuoteStatic from './HighlightQuoteStatic';

require('./highlightQuote.scss');

const propTypes = {
	getHighlightContent: PropTypes.func,
	hoverBackgroundColor: PropTypes.string,
	hideScrollButton: PropTypes.bool,
	/* All addons get the following props,
	but certain schema-based addons may not need them */
	// containerId: PropTypes.string.isRequired,
	// view: PropTypes.object.isRequired,
	// editorState: PropTypes.object.isRequired,
};
const defaultProps = {
	getHighlightContent: undefined,
	hoverBackgroundColor: 'red',
	hideScrollButton: false,
};

class HighlightQuote extends Component {
	static schema = (props)=> {
		return {
			nodes: {
				highlightQuote: {
					atom: true,
					attrs: {
						to: { default: null },
						from: { default: null },
						id: { default: null },
						exact: { default: null },
						suffix: { default: null },
						prefix: { default: null },
						version: { default: null },
					},
					parseDOM: [{
						tag: 'highlightquote',
						getAttrs: (node)=> {
							return {
								to: node.getAttribute('data-to') || null,
								from: node.getAttribute('data-from') || null,
								id: node.getAttribute('data-id') || null,
								exact: node.getAttribute('data-exact') || null,
								suffix: node.getAttribute('data-suffix') || null,
								prefix: node.getAttribute('data-prefix') || null,
								version: node.getAttribute('data-version') || null,
							};
						}
					}],
					toDOM: (node)=> {
						return ['highlightquote', {
							'data-to': node.attrs.to,
							'data-from': node.attrs.from,
							'data-id': node.attrs.id,
							'data-exact': node.attrs.exact,
							'data-suffix': node.attrs.suffix,
							'data-prefix': node.attrs.prefix,
							'data-version': node.attrs.version,
						}];
					},
					inline: false,
					group: 'block',
					draggable: false,
					selectable: true,
					toEditable(node, view, decorations, isSelected) {
						return (
							<HighlightQuoteStatic
								to={node.attrs.to}
								from={node.attrs.from}
								id={node.attrs.id}
								exact={node.attrs.exact}
								suffix={node.attrs.suffix}
								prefix={node.attrs.prefix}
								version={node.attrs.version}
								isSelected={isSelected}
								isEditable={true}
								hoverBackgroundColor={props.hoverBackgroundColor}
								hideScrollButton={props.hideScrollButton}
							/>
						);
					},
					toStatic(node) {
						return (
							<HighlightQuoteStatic
								key={node.currIndex}
								to={node.attrs.to}
								from={node.attrs.from}
								id={node.attrs.id}
								exact={node.attrs.exact}
								suffix={node.attrs.suffix}
								prefix={node.attrs.prefix}
								version={node.attrs.version}
								hoverBackgroundColor={props.hoverBackgroundColor}
								hideScrollButton={props.hideScrollButton}
							/>
						);
					},
				},
			}
		};
	};
	static pluginName = 'HighlightQuote';
	static getPlugins({ pluginKey, getHighlightContent }) {
		return [new Plugin({
			key: pluginKey,
			props: {
				transformPasted(slice) {
					const node = slice.content.content[0];
					const singleChild = slice.content.childCount === 1;
					const matchesString = /^(https:\/\/){1}(.+)(\/pub\/)(.+)(?=(.*to=[0-9]+))(?=(.*from=[0-9]+))/.test(node.textContent.trim());
					// const primaryEditorState = primaryEditorRef.state.editorState;
					// console.log(getHighlightContent, singleChild)
					if (getHighlightContent
						&& singleChild
						&& matchesString
					) {
						const to = Number(node.textContent.match(/.*to=([0-9]+)/)[1]);
						const from = Number(node.textContent.match(/.*from=([0-9]+)/)[1]);
						const newNodeData = getHighlightContent(from, to);
						// let exact = '';
						// primaryEditorState.doc.slice(from, to).content.forEach((sliceNode)=>{ exact += sliceNode.textContent; });
						// let prefix = '';
						// primaryEditorState.doc.slice(Math.max(0, from - 10), Math.max(0, from)).content.forEach((sliceNode)=>{ prefix += sliceNode.textContent; });
						// let suffix = '';
						// primaryEditorState.doc.slice(Math.min(primaryEditorState.doc.nodeSize - 2, to), Math.min(primaryEditorState.doc.nodeSize - 2, to + 10)).content.forEach((sliceNode)=>{ suffix += sliceNode.textContent; });
						// console.log(to, from, exact, prefix, suffix);
						const newNode = node.type.schema.nodes.highlightQuote.create(newNodeData);
						/* TODO: this doesn't paste correctly inline */
						return new Slice(Fragment.fromArray([newNode, node.type.schema.nodes.paragraph.create()]), slice.openStart, slice.openEnd);
					}
					return slice;
				},
			},
		})];
	}

	render() {
		return null;
	}
}

HighlightQuote.propTypes = propTypes;
HighlightQuote.defaultProps = defaultProps;
export default HighlightQuote;
