import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Plugin, TextSelection } from 'prosemirror-state';
import { Decoration, DecorationSet } from 'prosemirror-view';
// import { Slice, Fragment } from 'prosemirror-model';
import * as textQuote from 'dom-anchor-text-quote';
import stringHash from 'string-hash';
import { Popover, PopoverInteractionKind, Position } from '@blueprintjs/core';

require('./highlightMenu.scss');

const propTypes = {
	highlights: PropTypes.array,
	versionId: PropTypes.string,
	onNewDiscussion: PropTypes.func,
	onSelectionClick: PropTypes.func,
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
	primaryEditorClassName: undefined,
	containerId: undefined,
	view: undefined,
	editorState: undefined,
};

class HighlightMenu extends Component {
	static pluginName = 'HighlightMenu';
	static getPlugins({ pluginKey, primaryEditorClassName }) {
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

					
					let posBasedExact;
					let stillInTact = false;
					if (transaction.meta.newSelectionData) {
						const newData = transaction.meta.newSelectionData;
						const datafrom = newData.from;
						const datato = newData.to;
						posBasedExact = editorState.doc.textBetween(datafrom, datato);
						// editorState.doc.slice(datafrom, datato).content.forEach((sliceNode)=>{ posBasedExact += sliceNode.textContent; });
						stillInTact = posBasedExact === newData.exact;
					}
					// debugger;
					// console.log(posBasedExact, stillInTact);
					if (transaction.meta.clearTempSelection) {
						const tempSelections = decoSet.find().filter((item)=>{ return item.type.attrs.class.indexOf('temp-selection') > -1; });
						newDecoSet = decoSet.remove(tempSelections);
					// } else if (transaction.meta.newSelection) {
					// 	const from = transaction.meta.newSelectionData.from;
					// 	const to = transaction.meta.newSelectionData.to;
					// 	let exact = '';
					// 	editorState.doc.slice(from, to).content.forEach((sliceNode)=>{ exact += sliceNode.textContent; });
					// 	console.log('exact is', exact, 'transactionexact is', transaction.meta.newSelectionData.exact);
					// 	if (exact === transaction.meta.newSelectionData.exact) {
					// 		newDecoSet = decoSet.add(editorState.doc, [Decoration.inline(from, to, {
					// 			class: `cite-deco ${transaction.meta.newSelectionData.id}`,
					// 		})]);
					// 	} else {
					// 		const container = document.getElementsByClassName(primaryEditorClassName)[0];
					// 		const range = textQuote.toRange(container, {
					// 			exact: transaction.meta.newSelectionData.exact,
					// 			prefix: transaction.meta.newSelectionData.prefix,
					// 			suffix: transaction.meta.newSelectionData.suffix,
					// 		});
					// 		if (!range) {
					// 			newDecoSet = decoSet;
					// 		} else {
					// 			const from = editorState.doc.resolve(range.commonAncestorContainer.pmViewDesc.posAtStart + range.startOffset).pos;
					// 			const to = editorState.doc.resolve(range.commonAncestorContainer.pmViewDesc.posAtStart + range.endOffset).pos;
					// 			// const from = editorState.doc.resolve(range.endContainer.pmViewDesc.posAtStart - range.startContainer.length).pos;
					// 			// const to = editorState.doc.resolve(range.endContainer.pmViewDesc.posAtStart).pos;
					// 			// debugger;
					// 			newDecoSet = decoSet.add(editorState.doc, [Decoration.inline(from, to, {
					// 				class: `cite-deco ${transaction.meta.newSelectionData.id}`,
					// 			})]);
					// 		}
					// 	}
					// }



					} else if (transaction.meta.newSelection && (transaction.meta.newSelectionData.version || stillInTact)) {
						// console.log('is permanent', transaction.meta.newSelectionData.permanent);
						const from = transaction.meta.newSelectionData.from;
						const to = transaction.meta.newSelectionData.to;
						const tempSelections = decoSet.find().filter((item)=>{ return item.type.attrs.class.indexOf('temp-selection') > -1; });
						const classString = `cite-deco ${transaction.meta.newSelectionData.id} ${transaction.meta.newSelectionData.permanent ? 'permanent' : ''}`.trim();
						// console.log('classString', classString)
						newDecoSet = decoSet.remove(tempSelections).add(editorState.doc, [Decoration.inline(from, to, {
							class: classString,
						})]);
					} else if (transaction.meta.newSelection && !transaction.meta.newSelectionData.version) {
						// console.log('is permanent', transaction.meta.newSelectionData.permanent);
						const container = document.getElementsByClassName(primaryEditorClassName)[0];
						const range = textQuote.toRange(container, {
							exact: transaction.meta.newSelectionData.exact,
							prefix: transaction.meta.newSelectionData.prefix,
							suffix: transaction.meta.newSelectionData.suffix,
						});
						// console.log(transaction.meta.newSelectionData);
						// console.log('Doing it this way', range);
						// debugger;

						if (!range.startContainer.pmViewDesc || !range.endContainer.pmViewDesc) {
							console.log('Couldnt get pmview');
							debugger;
						}
						let resolvedStartContainer = range.startContainer;
						while (!resolvedStartContainer.pmViewDesc && resolvedStartContainer.className !== 'ProseMirror' && resolvedStartContainer !== null) {
							console.log('start', transaction.meta.newSelectionData.exact);
							resolvedStartContainer = resolvedStartContainer.parentElement;
						}
						let resolvedEndContainer = range.endContainer;
						while (!resolvedEndContainer.pmViewDesc && resolvedEndContainer.className !== 'ProseMirror' && resolvedEndContainer !== null) {
							console.log('end', transaction.meta.newSelectionData.exact);
							resolvedEndContainer = resolvedEndContainer.parentElement;
						}

						if (!resolvedStartContainer.pmViewDesc || !resolvedEndContainer.pmViewDesc) {
							console.log('Couldnt get pmview');
							debugger;
						}
						if (!range || !resolvedStartContainer.pmViewDesc || !resolvedEndContainer.pmViewDesc) {
							newDecoSet = decoSet;
						} else {
							const from = editorState.doc.resolve(resolvedStartContainer.pmViewDesc.posAtStart + range.startOffset).pos;
							const to = editorState.doc.resolve(resolvedEndContainer.pmViewDesc.posAtStart + range.endOffset).pos;
							// const from = editorState.doc.resolve(range.endContainer.pmViewDesc.posAtStart - range.startContainer.length).pos;
							// const to = editorState.doc.resolve(range.endContainer.pmViewDesc.posAtStart).pos;
							// debugger;
							const classString = `cite-deco ${transaction.meta.newSelectionData.id} ${transaction.meta.newSelectionData.permanent ? 'permanent' : ''}`.trim();
							// console.log('classString', classString)
							newDecoSet = decoSet.add(editorState.doc, [Decoration.inline(from, to, {
								class: classString,
							})]);
						}
					} else {
						newDecoSet = decoSet.map(transaction.mapping, transaction.doc);
					}

					return { formattedHighlights: newDecoSet };
				}
			},
			props: {
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
			setTimeout(()=> {
				this.completeNewDiscussion({
					from: item.from,
					to: item.to,
					id: item.id,
					exact: item.exact,
					prefix: item.prefix,
					suffix: item.suffix,
					version: item.version,
					permanent: item.permanent
				});
			}, 1);
			
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
			// const sel = view.state.selection;
			const exact = editorState.doc.textBetween(currentFromPos, currentToPos);
			// let string = '';
			// sel.content().content.forEach((node)=>{ string += node.textContent; });
			const prefix = editorState.doc.textBetween(Math.max(0, currentFromPos - 10), Math.max(0, currentFromPos));
			const suffix = editorState.doc.textBetween(Math.min(editorState.doc.nodeSize - 2, currentToPos), Math.min(editorState.doc.nodeSize - 2, currentToPos + 10));
			// let prefix = '';
			// editorState.doc.slice(Math.max(0, currentFromPos - 10), Math.max(0, currentFromPos)).content.forEach((node)=>{ prefix += node.textContent; });
			// let suffix = '';
			// editorState.doc.slice(Math.min(editorState.doc.nodeSize - 2, currentToPos), Math.min(editorState.doc.nodeSize - 2, currentToPos + 10)).content.forEach((node)=>{ suffix += node.textContent; });
			const output = {
				top: inlineTop,
				to: currentToPos,
				from: currentFromPos,
				// hash: stringHash(exact),
				exact: exact,
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
		const clearSelectionTransaction = this.props.view.state.tr.setSelection(new TextSelection(this.props.view.state.selection.$to));
		this.props.view.dispatch(clearSelectionTransaction);
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
		// setTimeout(()=> {
		// 	this.completeNewDiscussion({
		// 		from: this.state.from,
		// 		to: this.state.to,
		// 		id: 'fakeid',
		// 		version: this.props.versionId,
		// 		exact: this.state.exact,
		// 		prefix: this.state.prefix,
		// 		suffix: this.state.suffix,
		// 	});
		// }, 1000);
	}
	completeNewDiscussion({ from, to, id, hash, version, exact, prefix, suffix, permanent }) {
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
			permanent: permanent,
		});
		// console.log(JSON.stringify(transaction.meta.newSelectionData, null, 2));
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
			right: -20,
		};
		/* I think this will cause a problem if a single window has more */
		/* than one HighlightMenu in the globalscope */
		/* Don't know the right way to get pluginKey here */
		const pluginKeyString = this.props.editorState.plugins.reduce((prev, curr)=> {
			if (curr.key.indexOf('HighlightMenu') !== -1) {
				return curr.key;
			}
			return prev;
		}, undefined);
		const decos = this.props.editorState[pluginKeyString].formattedHighlights;
		let things;
		if (decos) {
			things = decos.find().filter((item)=> {
				return item.type.attrs.class.indexOf('temp-selection') === -1;
			}).map((item)=> {
				const className = item.type.attrs.class.replace('cite-deco ', '').replace(' permanent', '');
				const isPermanent = item.type.attrs.class.indexOf('permanent') > -1;
				const elem = document.getElementsByClassName(className)[0];
				// const wrapper = document.getElementsByClassName(this.props.primaryEditorClassName)[0];
				const wrapper = document.getElementsByClassName('things-wrapper')[0];
				const output = elem
					? {
						top: elem.getBoundingClientRect().top - wrapper.getBoundingClientRect().top,
						id: className,
						isPermanent: isPermanent,
					}
					: undefined;
				return output;
			}).filter((item)=> {
				return !!item;
			});
		}
		return (
			<div className={'highlight-menu'} onMouseDown={this.handleMouseDown}>
				<div className={'popover-wrapper'} style={wrapperStyle}>
					<Popover
						content={
							<div className={'selection-menu pt-card pt-elevation-2'}>
								{this.props.onNewDiscussion &&
									<div className={'button-wrapper'}>
										<button
											onClick={this.handleNewDiscussion}
											className={'pt-button pt-small pt-popover-dismiss'}
										>
											Create Discussion
										</button>
									</div>
								}
								<div className={'input-wrapper'}>
									<div>Link to Selection</div>
									<textarea
										type={'text'}
										className={'pt-input'}
										value={`${window.location.origin}${window.location.pathname}?from=${this.state.from}&to=${this.state.to}${this.props.versionId ? `&version=${this.props.versionId}` : ''}`}
										onChange={()=>{}}
									/>
								</div>
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
				<div className={'things-wrapper'}>
					{things && !!things.length && things.filter((item)=> {
						return !item.isPermanent;
					}).map((item)=> {
						return (
							<div
								role={'button'}
								tabIndex={-1}
								key={`thing-${item.id}`}
								className={'thing'}
								style={{ top: item.top + ((stringHash(item.id) % 10)) }}
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
			</div>
		);
	}
}

HighlightMenu.propTypes = propTypes;
HighlightMenu.defaultProps = defaultProps;
export default HighlightMenu;
