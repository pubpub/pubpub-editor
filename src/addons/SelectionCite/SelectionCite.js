import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Plugin, Selection } from 'prosemirror-state';
import { Decoration, DecorationSet } from 'prosemirror-view';
import { Slice, Fragment } from 'prosemirror-model';
import * as textQuote from 'dom-anchor-text-quote';
import stringHash from 'string-hash';
import { Popover, PopoverInteractionKind, Position } from '@blueprintjs/core';

require('./selectionCite.scss');

const propTypes = {
	highlights: PropTypes.array,
	versionId: PropTypes.string,
	onNewDiscussion: PropTypes.func,
	onSelectionClick: PropTypes.func,
	containerId: PropTypes.string,
	view: PropTypes.object,
	editorState: PropTypes.object,
};

const defaultProps = {
	highlights: [],
	versionId: undefined,
	onNewDiscussion: undefined,
	onSelectionClick: undefined,
	containerId: undefined,
	view: undefined,
	editorState: undefined,
};

class SelectionCite extends Component {
	static pluginName = 'SelectionCite';
	static getPlugins({ pluginKey, highlights, onSelectionClick }) {
		return [new Plugin({
			key: pluginKey,
			state: {
				init(config, editorState) {
					return {
						formattedHighlights: DecorationSet.create(editorState.doc, []),
					};
				},
				apply(transaction, state, prevEditorState, editorState) {
					const decoSet = state.formattedHighlights
					// let decoSet;

					// if (!state.formattedHighlights) {
					// 	const container = document.getElementsByClassName('selection-cite-wrapper')[0];
					// 	const newFormattedHighlights = highlights.filter((item)=> {
					// 		return !item.alreadyFormatted;
					// 	}).map((highlight)=> {
					// 		return {
					// 			range: textQuote.toRange(container, highlight),
					// 			id: highlight.id,
					// 		};
					// 	}).filter((item)=> {
					// 		return !!item.range;
					// 	}).map((item)=> {
					// 		return {
					// 			from: editorState.doc.resolve(item.range.commonAncestorContainer.pmViewDesc.posAtStart + item.range.startOffset),
					// 			to: editorState.doc.resolve(item.range.commonAncestorContainer.pmViewDesc.posAtStart + item.range.endOffset),
					// 			id: item.id,
					// 		};
					// 	});

					// 	decoSet = DecorationSet.create(editorState.doc, newFormattedHighlights.map((item)=> {
					// 		if (onSelectionClick) {
					// 			setTimeout(()=> {
					// 				const newElems = document.getElementsByClassName(item.id);
					// 				Array.from(newElems).forEach(function(element) {
					// 			    	element.addEventListener('click', ()=> { onSelectionClick(item.id); });
					// 				});
					// 			}, 100);
					// 		}
					// 		return Decoration.inline(item.from.pos, item.to.pos, {
					// 			class: `cite-deco ${item.id}`,
					// 		});
					// 	}))
					// } else {
					// 	decoSet = state.formattedHighlights;
					// }

					let newDecoSet;
					if (transaction.meta.clearTempSelection) {
						const tempSelections = decoSet.find().filter((item)=>{ return item.type.attrs.class.indexOf('temp-selection') > -1; });
						newDecoSet = decoSet.remove(tempSelections);
					} else if (transaction.meta.newSelection) {
						console.log(transaction);
						const from = transaction.meta.newSelectionFrom;
						const to = transaction.meta.newSelectionTo;
						const tempSelections = decoSet.find().filter((item)=>{ return item.type.attrs.class.indexOf('temp-selection') > -1; });
						newDecoSet = decoSet.remove(tempSelections).add(editorState.doc, [Decoration.inline(from, to, {
							class: `cite-deco ${transaction.meta.newSelectionId}`,
						})]);
						// if (onSelectionClick && transaction.meta.newSelectionId !== 'temp-selection') {
						// 	setTimeout(()=> {
						// 		const newElems = document.getElementsByClassName(transaction.meta.newSelectionId);
						// 		Array.from(newElems).forEach(function(element) {
						// 	    	element.addEventListener('click', ()=> { onSelectionClick(transaction.meta.newSelectionId); });
						// 		});
						// 	}, 100);
						// }
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
					if (singleChild && matchesString) {
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
			to: undefined,
			from: undefined,
			hash: undefined,
			activeHover: undefined,
			createdHighlights: [],
		};
		this.onChange = this.onChange.bind(this);
		this.handleMouseDown = this.handleMouseDown.bind(this);
		this.handleClick = this.handleClick.bind(this);
		this.completeNewDiscussion = this.completeNewDiscussion.bind(this);
		this.cancelNewDiscussion = this.cancelNewDiscussion.bind(this);
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
			this.completeNewDiscussion(item.from, item.to, item.id)
		});
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
			const inlineTop = view.coordsAtPos(currentFromPos).top - container.getBoundingClientRect().top;
			const sel = view.state.selection;
			let string = '';
			sel.content().content.forEach((node)=>{ string += node.textContent; })
			const output = {
				top: inlineTop,
				to: currentToPos,
				from: currentFromPos,
				hash: stringHash(string),
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
		transaction.setMeta('newSelectionId', hash);
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
	handleNewDiscussion() {
		this.setState({ top: null });
		this.props.onNewDiscussion({
			from: this.state.from,
			to: this.state.to,
			hash: this.props.versionId ? undefined : this.state.hash,
			version: this.props.versionId,
			onComplete: this.completeNewDiscussion,
			onCancel: this.cancelNewDiscussion,
		});
		const transaction = this.props.view.state.tr;
		transaction.setMeta('newSelection', true);
		transaction.setMeta('newSelectionFrom', this.state.from);
		transaction.setMeta('newSelectionTo', this.state.to);
		transaction.setMeta('newSelectionId', 'temp-selection');
		this.props.view.dispatch(transaction);
		setTimeout(()=> {
			this.completeNewDiscussion(this.state.from, this.state.to, 'fakeid');
		}, 1000);
	}
	completeNewDiscussion(from, to, id) {
		console.log(from, to, id);
		const transaction = this.props.view.state.tr;
		transaction.setMeta('newSelection', true);
		transaction.setMeta('newSelectionFrom', from);
		transaction.setMeta('newSelectionTo', to);
		transaction.setMeta('newSelectionId', id);
		this.props.view.dispatch(transaction);
		this.setState({ top: null });
	}
	cancelNewDiscussion() {
		const transaction = this.props.view.state.tr;
		transaction.setMeta('clearTempSelection', true);
		this.props.view.dispatch(transaction);
	}
	handleMouseEnter(className) {
		this.setState({ activeHover: className });
		// console.log('in mouse enter');
		// const elems = document.getElementsByClassName(className);
		// Array.from(elems).forEach(function(element) {
	 //    	element.className += ' active';
		// });
	}
	handleMouseLeave(className) {
		this.setState({ activeHover: undefined });
	// 	console.log('in mouse leave');
	// 	const elems = document.getElementsByClassName(className);
	// 	Array.from(elems).forEach(function(element) {
	//     	element.className = element.className.replace(' active', '');
	// 	});
	}

	render() {
		const wrapperStyle = {
			display: this.state.top !== null ? 'block' : 'none',
			transform: `translateY(${Math.max(this.state.top, 0)}px)`,
			top: 0,
			right: 0,
		};
		const decos = this.props.editorState['SelectionCite$'].formattedHighlights;
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
			<div className={'selection-cite'} onMouseDown={this.handleMouseDown}>
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
						popoverClassName={'selection-cite-menu-wrapper pt-minimal'}
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
						{things.map((item, index)=> {
							return (
								<div
									key={`thing-${index}`}
									className={'thing'}
									style={{ top: item.top }}
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

SelectionCite.propTypes = propTypes;
SelectionCite.defaultProps = defaultProps;
export default SelectionCite;
