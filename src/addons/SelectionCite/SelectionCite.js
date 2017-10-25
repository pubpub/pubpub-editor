import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Plugin, Selection } from 'prosemirror-state';
import { Decoration, DecorationSet } from 'prosemirror-view';
import { Slice, Fragment } from 'prosemirror-model';
import * as textQuote from 'dom-anchor-text-quote';
import stringHash from 'string-hash';

require('./selectionCite.scss');

const propTypes = {
	highlights: PropTypes.array,
	versionId: PropTypes.string,
	onNewDiscussion: PropTypes.func,
	containerId: PropTypes.string,
	view: PropTypes.object,
	editorState: PropTypes.object,
};

const defaultProps = {
	highlights: [],
	versionId: undefined,
	onNewDiscussion: undefined,
	containerId: undefined,
	view: undefined,
	editorState: undefined,
};

class SelectionCite extends Component {
	static pluginName = 'SelectionCite';
	static getPlugins({ pluginKey, highlights }) {
		return [new Plugin({
			key: pluginKey,
			state: {
				init(config, instance) {
					return {
						formattedHighlights: undefined,
					};
				},
				apply(transaction, state, prevEditorState, editorState) {
					let decoSet;

					if (!state.formattedHighlights) {
						const container = document.getElementsByClassName('selection-cite-wrapper')[0];
						const newFormattedHighlights = highlights.filter((item)=> {
							return !item.alreadyFormatted;
						}).map((highlight)=> {
							return {
								range: textQuote.toRange(container, highlight),
								id: highlight.id,
							};
						}).filter((item)=> {
							return !!item.range;
						}).map((item)=> {
							return {
								from: editorState.doc.resolve(item.range.commonAncestorContainer.pmViewDesc.posAtStart + item.range.startOffset),
								to: editorState.doc.resolve(item.range.commonAncestorContainer.pmViewDesc.posAtStart + item.range.endOffset),
								id: item.id,
							};
						});

						decoSet = DecorationSet.create(editorState.doc, newFormattedHighlights.map((item)=> {
							return Decoration.inline(item.from.pos, item.to.pos, {
								class: `cite-deco ${item.id}`,
								// style: `background-color: ${data.backgroundColor || 'rgba(0, 25, 150, 0.2)'};`,
							});
						}))
					} else {
						decoSet = state.formattedHighlights;
					}

					let newDecoSet;
					if (transaction.meta.newSelection) {
						console.log('Got a transaction!', transaction);
						const from = transaction.curSelection.from;
						const to = transaction.curSelection.to;
						newDecoSet = decoSet.add(editorState.doc, [Decoration.inline(from, to, {
							class: `cite-deco ${transaction.meta.newSelectionHash}`,
							// style: `background-color: ${data.backgroundColor || 'rgba(0, 25, 150, 0.2)'};`,
						})])
					} else {
						newDecoSet = decoSet.map(transaction.mapping, transaction.doc);	
					}

					return { formattedHighlights: newDecoSet };
				}
			},
			props: {
				transformPasted(slice) {
					console.log('pasted ', slice);
					// return slice;
					// const output = slice;
					// output.content.content = [schema.nodes.horizontal_rule.create()];
					const node = slice.content.content[0];
					const singleChild = slice.content.childCount === 1;
					const matchesString = /^(https:\/\/){1}(.+)(\/pub\/)(.+)(?=(.*to=[0-9]+))(?=(.*from=[0-9]+))(?=(.*((hash=[0-9]+)|(version=[0-9a-z-]+))))/.test(node.textContent);
					if (singleChild && matchesString) {
						/* I don't know if the values after array are necessary */
						return new Slice(Fragment.fromArray([node.type.schema.nodes.horizontal_rule.create()]), slice.openStart, slice.openEnd);
					}
					return slice;
					
				},
				decorations(editorState) {
					return pluginKey.getState(editorState).formattedHighlights;
				}
			},
		})];
	}
	constructor(props) {
		super(props);
		this.state = {
			top: null,
			left: 0,
		};
		this.onChange = this.onChange.bind(this);
		this.handleMouseDown = this.handleMouseDown.bind(this);
		this.handleClick = this.handleClick.bind(this);
	}

	componentWillReceiveProps(nextProps) {
		if (this.props.editorState !== nextProps.editorState) {
			this.onChange();
		}
	}

	onChange() {
		const { view, containerId } = this.props;
		const currentPos = view.state.selection.$to.pos;
		if (currentPos === 0) { return null; }
		const currentNode = view.state.doc.nodeAt(currentPos - 1);
		const container = document.getElementById(containerId);
		if (!view.state.selection.$cursor && currentNode && currentNode.text) {
			const currentFromPos = view.state.selection.$from.pos;
			const currentToPos = view.state.selection.$to.pos;
			const left = view.coordsAtPos(currentFromPos).left - container.getBoundingClientRect().left;
			const right = view.coordsAtPos(currentToPos).right - container.getBoundingClientRect().left;
			const inlineCenter = left + ((right - left) / 2);
			const inlineTop = view.coordsAtPos(currentFromPos).top - container.getBoundingClientRect().top;
			const sel = view.state.selection;
			let string = '';
			sel.content().content.forEach((node)=>{ string += node.textContent; })
			const output = {
				left: inlineCenter,
				top: inlineTop,
				to: currentToPos,
				from: currentFromPos,
				hash: stringHash(string),
			};
			return this.setState(output);
		}

		return this.setState({
			left: 0,
			top: null,
			input: null,
		});
	}

	handleMouseDown(evt) {
		// This is to prevent losing focus on menu click
		evt.preventDefault();
	}

	handleClick() {
		console.log('Clicked it');
		this.props.view.focus();

		const transaction = this.props.view.state.tr;
		transaction.setMeta('newSelection', true);
		
		const possible = 'abcdefghijklmnopqrstuvwxyz';
		let hash = '';
		for (let index = 0; index < 8; index++) {
			hash += possible.charAt(Math.floor(Math.random() * possible.length));
		}
		transaction.setMeta('newSelectionHash', hash);
		this.props.view.dispatch(transaction);
		// call props function with text content, pre, suffix, and id
		// setState to hide selection


		/* 
			the props function gets the object, creates a new discussion passes it
			to an editor which instanties a quote block.
			Maybe another function which is exposed that allows 'add new selection'
			so that we only draw selection on completion.
			Maybe the first callback can be given an 'onSelectionCreated' and 'onSelectionCancelled'
			callback to be used. which triggers  drawing or undrawing.

			How does any of this work from copy/pasting a link?
		*/
	}

	render() {
		const padding = 5;
		const width = 50;
		// const width = 327;
		const wrapperStyle = {
			display: this.state.top !== null ? 'block' : 'none',
			top: Math.max(this.state.top - 40, 0),
			width: `${width}px`,
			left: Math.max(this.state.left - (width / 2), 0),
			padding: `0px ${padding}px`
		};
		return (
			<div className={'selection-cite'} style={wrapperStyle} onMouseDown={this.handleMouseDown}>
				<div
					role={'button'}
					tabIndex={-1}
					className={'button pt-icon-bookmark'}
					onClick={this.handleClick}
				>
					{window.location.origin}{window.location.pathname}?from={this.state.from}&to={this.state.to}&{this.props.versionId ? 'version' : 'hash'}={this.props.versionId || this.state.hash}
				</div>
			</div>
		);
	}
}

SelectionCite.propTypes = propTypes;
SelectionCite.defaultProps = defaultProps;
export default SelectionCite;
