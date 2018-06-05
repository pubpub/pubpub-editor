import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Plugin, TextSelection } from 'prosemirror-state';
import { Decoration, DecorationSet } from 'prosemirror-view';
import * as textQuote from 'dom-anchor-text-quote';
import stringHash from 'string-hash';
import { Tooltip } from '@blueprintjs/core';
import { CopyToClipboard } from 'react-copy-to-clipboard';

require('./highlightMenu.scss');

const propTypes = {
	highlights: PropTypes.array,
	versionId: PropTypes.string,
	sectionId: PropTypes.string,
	onNewDiscussion: PropTypes.func,
	onDotClick: PropTypes.func,
	primaryEditorClassName: PropTypes.string,
	hoverBackgroundColor: PropTypes.string.isRequired,
	containerId: PropTypes.string,
	view: PropTypes.object,
	editorState: PropTypes.object,
};

const defaultProps = {
	highlights: [],
	versionId: undefined,
	sectionId: undefined,
	onNewDiscussion: undefined,
	onDotClick: undefined,
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
					let newDecoSet = state.formattedHighlights;
					const newSelectionHighlights = transaction.meta.newSelectionData;

					if (transaction.meta.clearTempSelection) {
						const tempSelections = newDecoSet.find().filter((item)=>{ return item.type.attrs.class.indexOf('temp-selection') > -1; });
						return { formattedHighlights: newDecoSet.remove(tempSelections) };
					}

					if (!newSelectionHighlights) {
						return { formattedHighlights: newDecoSet.map(transaction.mapping, transaction.doc) };
					}

					newSelectionHighlights.forEach((newHighlightData)=> {
						let posBasedExact;
						let stillInTact = false;

						const datafrom = Number(newHighlightData.from);
						const datato = Number(newHighlightData.to);
						if (editorState.doc.nodeSize >= datafrom && editorState.doc.nodeSize >= datato) {
							posBasedExact = editorState.doc.textBetween(datafrom, datato);
						}
						stillInTact = posBasedExact === newHighlightData.exact;

						if (stillInTact) {
							const from = Number(newHighlightData.from);
							const to = Number(newHighlightData.to);
							const tempSelections = newDecoSet.find().filter((item)=>{ return item.type.attrs.class.indexOf('temp-selection') > -1; });
							newDecoSet = newDecoSet.remove(tempSelections).add(editorState.doc, [Decoration.inline(from, to, {
								class: `highlight-background ${newHighlightData.id} ${newHighlightData.permanent ? 'permanent' : ''}`.trim(),
							})]);
						} else {
							const container = document.getElementsByClassName(primaryEditorClassName)[0];
							const range = textQuote.toRange(container, {
								exact: newHighlightData.exact,
								prefix: newHighlightData.prefix,
								suffix: newHighlightData.suffix,
							});
							let resolvedStartContainer;
							let resolvedEndContainer;
							if (range) {
								resolvedStartContainer = range.startContainer;
								while (resolvedStartContainer && !resolvedStartContainer.pmViewDesc && resolvedStartContainer.className !== 'ProseMirror') {
									resolvedStartContainer = resolvedStartContainer.parentElement;
								}
								resolvedEndContainer = range.endContainer;
								while (resolvedEndContainer && !resolvedEndContainer.pmViewDesc && resolvedEndContainer.className !== 'ProseMirror') {
									resolvedEndContainer = resolvedEndContainer.parentElement;
								}
							}
							if (range && resolvedStartContainer && resolvedStartContainer.pmViewDesc && resolvedEndContainer && resolvedEndContainer.pmViewDesc) {
								const from = editorState.doc.resolve(resolvedStartContainer.pmViewDesc.posAtStart + range.startOffset).pos;
								const to = editorState.doc.resolve(resolvedEndContainer.pmViewDesc.posAtStart + range.endOffset).pos;
								newDecoSet = newDecoSet.add(editorState.doc, [Decoration.inline(from, to, {
									class: `highlight-background ${newHighlightData.id} ${newHighlightData.permanent ? 'permanent' : ''}`.trim(),
								})]);
							}
						}
					});
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
			activeHover: undefined,
			createdHighlights: [],
			copied: false,
		};
		this.onChange = this.onChange.bind(this);
		this.handleMouseDown = this.handleMouseDown.bind(this);
		this.completeNewDiscussion = this.completeNewDiscussion.bind(this);
		this.handleNewDiscussion = this.handleNewDiscussion.bind(this);
		this.handleMouseEnter = this.handleMouseEnter.bind(this);
		this.handleMouseLeave = this.handleMouseLeave.bind(this);
		this.handleNewHighlightProps = this.handleNewHighlightProps.bind(this);
	}

	componentWillMount() {
		this.handleNewHighlightProps(this.props);
		/* In some cases we need to be be a bit vigilant about the doc being */
		/* ready before applying the first batch of highlights. Such as the  */
		/* collab server taking time to initialize the doc. */
		// setTimeout(()=> {
		// 	this.handleNewHighlightProps(this.props);
		// }, 2000);
	}

	componentWillReceiveProps(nextProps) {
		if (this.props.editorState !== nextProps.editorState) {
			this.onChange();
		}

		this.handleNewHighlightProps(nextProps);
	}

	onChange() {
		const { view, containerId, editorState } = this.props;
		const currentPos = view.state.selection.$to.pos;
		if (currentPos === 0 || !editorState || !editorState.doc || editorState.doc.nodeSize - 1 < currentPos) { return null; }
		const currentNode = editorState.doc.nodeAt(currentPos - 1);
		const container = document.getElementById(containerId);
		if (!view.state.selection.$cursor && currentNode && currentNode.text) {
			const currentFromPos = view.state.selection.$from.pos;
			const currentToPos = view.state.selection.$to.pos;
			const inlineTop = view.coordsAtPos(currentFromPos).top - container.getBoundingClientRect().top;
			const exact = editorState.doc.textBetween(currentFromPos, currentToPos);
			const prefix = editorState.doc.textBetween(Math.max(0, currentFromPos - 10), Math.max(0, currentFromPos));
			const suffix = editorState.doc.textBetween(Math.min(editorState.doc.nodeSize - 2, currentToPos), Math.min(editorState.doc.nodeSize - 2, currentToPos + 10));
			const output = {
				top: inlineTop,
				to: currentToPos,
				from: currentFromPos,
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

	handleNewHighlightProps(props) {
		const createdHighlightIds = this.state.createdHighlights.map((item)=> {
			return item.id;
		});

		this.setState({ createdHighlights: props.highlights });

		const highlightData = props.highlights.filter((item)=> {
			return createdHighlightIds.indexOf(item.id) === -1;
		}).map((item)=> {
			// setTimeout(()=> {
			return {
				from: item.from,
				to: item.to,
				id: item.id,
				exact: item.exact,
				prefix: item.prefix,
				suffix: item.suffix,
				version: item.version,
				permanent: item.permanent
			};
		});

		if (highlightData.length) {
			setTimeout(()=> {
				const transaction = this.props.view.state.tr;
				transaction.setMeta('newSelection', true);
				transaction.setMeta('newSelectionData', highlightData);
				this.props.view.dispatch(transaction);
			}, 1);
		}
	}

	handleNewDiscussion() {
		const clearSelectionTransaction = this.props.view.state.tr.setSelection(new TextSelection(this.props.view.state.selection.$to));
		this.props.view.dispatch(clearSelectionTransaction);
		this.props.onNewDiscussion({
			from: this.state.from,
			to: this.state.to,
			version: this.props.versionId,
			section: this.props.sectionId,
			exact: this.state.exact,
			prefix: this.state.prefix,
			suffix: this.state.suffix,
			// onComplete: this.completeNewDiscussion,
			// onCancel: this.cancelNewDiscussion,
		});
	}
	completeNewDiscussion({ from, to, id, version, exact, prefix, suffix, permanent }) {
		const transaction = this.props.view.state.tr;
		transaction.setMeta('newSelection', true);
		transaction.setMeta('newSelectionData', [
			{
				from: from,
				to: to,
				id: id,
				version: version,
				exact: exact,
				prefix: prefix,
				suffix: suffix,
				permanent: permanent,
			}
		]);
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
			// right: -20,
			right: -35,
		};
		const pluginKeyString = this.props.editorState.plugins.reduce((prev, curr)=> {
			if (curr.key.indexOf('HighlightMenu') !== -1) {
				return curr.key;
			}
			return prev;
		}, undefined);
		const decos = this.props.editorState[pluginKeyString].formattedHighlights;
		let dots;
		if (decos && this.props.onDotClick) {
			dots = decos.find().filter((item)=> {
				return item.type.attrs.class.indexOf('temp-selection') === -1;
			}).map((item)=> {
				const className = item.type.attrs.class.replace('highlight-background ', '').replace(' permanent', '');
				const isPermanent = item.type.attrs.class.indexOf('permanent') > -1;
				const elem = document.getElementsByClassName(className)[0];
				const wrapper = document.getElementsByClassName('highlight-dot-wrapper')[0];
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
					{this.props.onNewDiscussion &&
						<button className="pt-button pt-minimal pt-icon-chat" onClick={this.handleNewDiscussion} />
					}
					<Tooltip isOpen={this.state.copied} content={<span><span className="pt-icon-standard pt-icon-tick" /> Permalink copied to clipboard</span>} tooltipClassName="pt-dark">
						<CopyToClipboard
							text={`${window.location.origin}${window.location.pathname}?from=${this.state.from}&to=${this.state.to}${this.props.versionId ? `&version=${this.props.versionId}` : ''}`}
							onCopy={() => {
								this.setState({ copied: true });
								setTimeout(()=> {
									this.setState({ copied: false });
								}, 2500);
							}}
						>
							<button className="pt-button pt-minimal pt-icon-link" />
						</CopyToClipboard>
					</Tooltip>
				</div>
				{this.props.onDotClick &&
					<div className={'highlight-dot-wrapper'}>
						{dots && !!dots.length && dots.filter((item)=> {
							return !item.isPermanent;
						}).map((item)=> {
							return (
								<div
									role={'button'}
									tabIndex={-1}
									key={`dot-${item.id}`}
									className={'highlight-dot'}
									style={{ top: item.top + ((stringHash(item.id) % 10)) }}
									onMouseEnter={()=> { this.handleMouseEnter(item.id); }}
									onMouseLeave={()=> { this.handleMouseLeave(item.id); }}
									onClick={()=> {
										this.props.onDotClick(item.id);
									}}
								>
									{this.state.activeHover === item.id &&
										<style>{`.${item.id} { background-color: ${this.props.hoverBackgroundColor} !important; }`}</style>
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

HighlightMenu.propTypes = propTypes;
HighlightMenu.defaultProps = defaultProps;
export default HighlightMenu;
