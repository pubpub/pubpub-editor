import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Plugin, Selection } from 'prosemirror-state';
import { Decoration, DecorationSet } from 'prosemirror-view';
import { Slice, Fragment } from 'prosemirror-model';
import * as textQuote from 'dom-anchor-text-quote';
import stringHash from 'string-hash';
import { Popover, PopoverInteractionKind, Position } from '@blueprintjs/core';

require('./highlight.scss');

const propTypes = {
	highlights: PropTypes.array,
	versionId: PropTypes.string,
	onNewDiscussion: PropTypes.func,
	onSelectionClick: PropTypes.func,
	primaryEditorState: PropTypes.object,
	primaryEditorClassName: PropTypes.string,
	containerId: PropTypes.string,
	view: PropTypes.object,
	editorState: PropTypes.object,
};

const defaultProps = {
	highlights: [],
	versionId: undefined,
	onNewDiscussion: undefined,
	onSelectionClick: undefined,
	primaryEditorState: undefined,
	primaryEditorClassName: undefined,
	containerId: undefined,
	view: undefined,
	editorState: undefined,
};

class Highlight extends Component {
	static pluginName = 'Highlight';
	static getPlugins({ pluginKey, primaryEditorState, primaryEditorClassName }) {
		return [new Plugin({
			key: pluginKey,
			state: {
				init(config, editorState) {
					return {
						formattedHighlights: DecorationSet.create(editorState.doc, []),
					};
				},
				apply(transaction, state, prevEditorState, editorState) {
					const decoSet = state.formattedHighlights;
					let newDecoSet;
					if (transaction.meta.clearTempSelection) {
						const tempSelections = decoSet.find().filter((item)=>{ return item.type.attrs.class.indexOf('temp-selection') > -1; });
						newDecoSet = decoSet.remove(tempSelections);
					} else if (transaction.meta.newSelection && transaction.meta.newSelectionData.version) {
						const from = transaction.meta.newSelectionData.from;
						const to = transaction.meta.newSelectionData.to;
						const tempSelections = decoSet.find().filter((item)=>{ return item.type.attrs.class.indexOf('temp-selection') > -1; });
						newDecoSet = decoSet.remove(tempSelections).add(editorState.doc, [Decoration.inline(from, to, {
							class: `cite-deco ${transaction.meta.newSelectionData.id}`,
						})]);
					} else if (transaction.meta.newSelection && !transaction.meta.newSelectionData.version) {
						const container = document.getElementsByClassName(primaryEditorClassName)[0];
						const range = textQuote.toRange(container, {
							exact: transaction.meta.newSelectionData.exact,
							prefix: transaction.meta.newSelectionData.prefix,
							suffix: transaction.meta.newSelectionData.suffix,
						});
						console.log('Doing it this way', range);
						if (!range) {
							newDecoSet = decoSet;
						} else {

							const from = editorState.doc.resolve(range.commonAncestorContainer.pmViewDesc.posAtStart + range.startOffset).pos;
							const to = editorState.doc.resolve(range.commonAncestorContainer.pmViewDesc.posAtStart + range.endOffset).pos;
							console.log(from, to);
							newDecoSet = decoSet.add(editorState.doc, [Decoration.inline(from, to, {
								class: `cite-deco ${transaction.meta.newSelectionData.id}`,
							})]);
						}
					} else {
						newDecoSet = decoSet.map(transaction.mapping, transaction.doc);
					}

					return { formattedHighlights: newDecoSet };
				}
			},
			props: {
				transformPasted(slice) {
					const node = slice.content.content[0];
					const singleChild = slice.content.childCount === 1;
					const matchesString = /^(https:\/\/){1}(.+)(\/pub\/)(.+)(?=(.*to=[0-9]+))(?=(.*from=[0-9]+))(?=(.*((hash=[0-9]+)|(version=[0-9a-z-]+))))/.test(node.textContent);
					if (node.type.schema.nodes.highlight
						&& primaryEditorState
						&& singleChild
						&& matchesString
					) {
						// const container = document.getElementsByClassName(primaryEditorClassName)[0];
						const to = node.textContent.match(/.*to=([0-9]+)/)[1];
						const from = node.textContent.match(/.*from=([0-9]+)/)[1];
						let exact = '';
						primaryEditorState.doc.slice(to, from).content.forEach((sliceNode)=>{ exact += sliceNode.textContent; });
						let prefix = '';
						primaryEditorState.doc.slice(Math.max(0, from - 10), Math.max(0, from)).content.forEach((sliceNode)=>{ prefix += sliceNode.textContent; });
						let suffix = '';
						primaryEditorState.doc.slice(Math.min(primaryEditorState.doc.nodeSize - 2, to), Math.min(primaryEditorState.doc.nodeSize - 2, to + 10)).content.forEach((sliceNode)=>{ suffix += sliceNode.textContent; });
						return new Slice(Fragment.fromArray([node.type.schema.nodes.highlight.create({
							exact: exact,
							prefix: prefix,
							suffix: suffix,
						})]), slice.openStart, slice.openEnd);
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
			to: undefined,
			from: undefined,
			hash: undefined,
			activeHover: undefined,
			createdHighlights: [],
		};
		this.onChange = this.onChange.bind(this);
		this.handleMouseDown = this.handleMouseDown.bind(this);
		// this.handleClick = this.handleClick.bind(this);
		this.completeNewDiscussion = this.completeNewDiscussion.bind(this);
		// this.cancelNewDiscussion = this.cancelNewDiscussion.bind(this);
		this.handleNewDiscussion = this.handleNewDiscussion.bind(this);
		this.handleMouseEnter = this.handleMouseEnter.bind(this);
		this.handleMouseLeave = this.handleMouseLeave.bind(this);
		
	}

	componentWillReceiveProps(nextProps) {
		if (this.props.editorState !== nextProps.editorState) {
			this.onChange();
		}


		const createdHighlightIds = this.state.createdHighlights.map((item)=> {
			return item.id;
		});
		this.setState({ createdHighlights: nextProps.highlights });	
		nextProps.highlights.filter((item)=> {
			return createdHighlightIds.indexOf(item.id) === -1;
		}).forEach((item)=> {
			this.completeNewDiscussion({
				from: item.from,
				to: item.to,
				id: item.id,
				exact: item.exact,
				prefix: item.prefix,
				suffix: item.suffix,
				version: item.version,
			});
		});
	}

	onChange() {
		const { view, containerId, editorState } = this.props;
		const currentPos = view.state.selection.$to.pos;
		if (currentPos === 0) { return null; }
		const currentNode = view.state.doc.nodeAt(currentPos - 1);
		const container = document.getElementById(containerId);
		if (!view.state.selection.$cursor && currentNode && currentNode.text) {
			const currentFromPos = view.state.selection.$from.pos;
			const currentToPos = view.state.selection.$to.pos;
			const inlineTop = view.coordsAtPos(currentFromPos).top - container.getBoundingClientRect().top;
			const sel = view.state.selection;
			let string = '';
			sel.content().content.forEach((node)=>{ string += node.textContent; });
			let prefix = '';
			editorState.doc.slice(Math.max(0, currentFromPos - 10), Math.max(0, currentFromPos)).content.forEach((node)=>{ prefix += node.textContent; });
			let suffix = '';
			editorState.doc.slice(Math.min(editorState.doc.nodeSize - 2, currentToPos), Math.min(editorState.doc.nodeSize - 2, currentToPos + 10)).content.forEach((node)=>{ suffix += node.textContent; });
			const output = {
				top: inlineTop,
				to: currentToPos,
				from: currentFromPos,
				hash: stringHash(string),
				exact: string,
				prefix: prefix,
				suffix: suffix,
			};
			return this.setState(output);
		}

		return this.setState({
			top: null,
		});
	}

	handleMouseDown(evt) {
		// This is to prevent losing focus on menu click
		evt.preventDefault();
	}

	// handleClick() {
	// 	console.log('Clicked it');
	// 	this.props.view.focus();

	// 	const transaction = this.props.view.state.tr;
	// 	transaction.setMeta('newSelection', true);
		
	// 	const possible = 'abcdefghijklmnopqrstuvwxyz';
	// 	let hash = '';
	// 	for (let index = 0; index < 8; index++) {
	// 		hash += possible.charAt(Math.floor(Math.random() * possible.length));
	// 	}
	// 	transaction.setMeta('newSelectionId', hash);
	// 	this.props.view.dispatch(transaction);
	// }
	handleNewDiscussion() {
		this.setState({ top: null });
		this.props.onNewDiscussion({
			from: this.state.from,
			to: this.state.to,
			hash: this.props.versionId ? undefined : this.state.hash,
			version: this.props.versionId,
			exact: this.state.exact,
			prefix: this.state.prefix,
			suffix: this.state.suffix,
			// onComplete: this.completeNewDiscussion,
			// onCancel: this.cancelNewDiscussion,
		});
		// const transaction = this.props.view.state.tr;
		// transaction.setMeta('newSelection', true);
		// transaction.setMeta('newSelectionData', {
		// 	from: this.state.from,
		// 	to: this.state.to,
		// 	id: 'temp-selection',
		// });
		// this.props.view.dispatch(transaction);
		setTimeout(()=> {
			this.completeNewDiscussion({
				from: this.state.from,
				to: this.state.to,
				id: 'fakeid'
			});
		}, 1000);
	}
	completeNewDiscussion({ from, to, id, hash, version, exact, prefix, suffix }) {
		const transaction = this.props.view.state.tr;
		transaction.setMeta('newSelection', true);
		transaction.setMeta('newSelectionData', {
			from: from,
			to: to,
			id: id,
			hash: hash,
			version: version,
			exact: exact,
			prefix: prefix,
			suffix: suffix,
		});
		// transaction.setMeta('newSelectionFrom', from);
		// transaction.setMeta('newSelectionTo', to);
		// transaction.setMeta('newSelectionId', id);
		this.props.view.dispatch(transaction);
		this.setState({ top: null });
	}
	// cancelNewDiscussion() {
	// 	const transaction = this.props.view.state.tr;
	// 	transaction.setMeta('clearTempSelection', true);
	// 	this.props.view.dispatch(transaction);
	// }
	handleMouseEnter(className) {
		this.setState({ activeHover: className });
	}
	handleMouseLeave() {
		this.setState({ activeHover: undefined });
	}

	render() {
		const wrapperStyle = {
			display: this.state.top !== null ? 'block' : 'none',
			transform: `translateY(${Math.max(this.state.top, 0)}px)`,
			top: 0,
			right: 0,
		};
		const decos = this.props.editorState.Highlight$.formattedHighlights;
		let things;
		if (decos) {
			things = decos.find().filter((item)=> {
				return item.type.attrs.class.indexOf('temp-selection') === -1;
			}).map((item)=> {
				const className = item.type.attrs.class.replace('cite-deco ', '');
				const elem = document.getElementsByClassName(className)[0];
				const output = elem
					? { top: elem.getBoundingClientRect().top, id: className }
					: undefined;
				return output;
			}).filter((item)=> {
				return !!item;
			});
		}
		return (
			<div className={'highlight'} onMouseDown={this.handleMouseDown}>
				<div className={'popover-wrapper'} style={wrapperStyle}>
					<Popover
						content={
							<div className={'selection-menu pt-card pt-elevation-2'}>
								{this.props.onNewDiscussion &&
									<button
										onClick={this.handleNewDiscussion}
										className={'pt-button pt-small pt-fill pt-popover-dismiss'}
									>
										New Discussion
									</button>
								}
								<input
									type={'text'}
									className={'pt-input'}
									value={`${window.location.origin}${window.location.pathname}?from=${this.state.from}&to=${this.state.to}&${this.props.versionId ? 'version' : 'hash'}=${this.props.versionId || this.state.hash}`}
									onChange={()=>{}}
								/>
							</div>
						}
						interactionKind={PopoverInteractionKind.CLICK}
						position={Position.BOTTOM_RIGHT}
						popoverClassName={'highlight-menu-wrapper pt-minimal'}
						transitionDuration={-1}
						inheritDarkTheme={false}
						tetherOptions={{
							constraints: [{ attachment: 'together', to: 'window' }]
						}}
					>
						<button className={'pt-button pt-minimal pt-icon-highlight'} />
					</Popover>
				</div>
				{things && !!things.length &&
					<div className={'things-wrapper'}>
						{things.map((item)=> {
							return (
								<div
									role={'button'}
									tabIndex={-1}
									key={`thing-${item.id}`}
									className={'thing'}
									style={{ top: (item.top - 5) + ((stringHash(item.id) % 10) - 5) }}
									onMouseEnter={()=> { this.handleMouseEnter(item.id); }}
									onMouseLeave={()=> { this.handleMouseLeave(item.id); }}
									onClick={()=> {
										this.props.onSelectionClick(item.id);
									}}
								>
									{this.state.activeHover !== item.id &&
										<style>{`.${item.id} { background-color: transparent; }`}</style>
									}
								</div>
							);
						})}
					</div>
				}
			</div>
		);
	}
}

Highlight.propTypes = propTypes;
Highlight.defaultProps = defaultProps;
export default Highlight;
