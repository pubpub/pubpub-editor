import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Plugin } from 'prosemirror-state';
import fuzzysearch from 'fuzzysearch';
import { getMenuItems, canUseInsertMenu } from './insertMenuConfig';

require('./insertMenu.scss');

const propTypes = {
	containerId: PropTypes.string,
	view: PropTypes.object,
	editorState: PropTypes.object,
	pluginKey: PropTypes.object,
};

const defaultProps = {
	containerId: undefined,
	view: undefined,
	editorState: undefined,
	pluginKey: undefined,
};

/**
* @module Addons
*/

/**
* @component
*
* Adds an Insert Menu to your document that allows users to insert other addons elements such as Images and Videos.
*
* @example
return (
	<Editor>
		<InsertMenu />
	</Editor>
);
*/
class InsertMenu extends Component {
	static pluginName = 'InsertMenu';
	static getPlugins({ pluginKey }) {
		return [new Plugin({
			key: pluginKey,
			state: {
				init() {
					return {
						isActive: false,
						start: 0,
						end: 0,
						positionNumber: 0,
						parentOffset: 0,
						emptyLine: false,
						substring: '',
					};
				},
				apply(transaction, state, prevEditorState, editorState) {
					const doc = editorState.doc;
					const emptyDoc = doc.childCount === 0 || (doc.childCount === 1 && doc.firstChild.isTextblock && doc.firstChild.content.size === 0);
					if (emptyDoc) { return null; }

					const canUse = canUseInsertMenu(editorState);
					const sel = editorState.selection;
					const currentPos = sel.$to;
					const currentNode = editorState.doc.nodeAt(currentPos.pos - 1);
					const text = currentNode && currentNode.textContent ? currentNode.textContent : '';
					const currentLine = text.replace(/\s/g, ' ');
					let parentOffset = currentPos.parentOffset;
					// sometimes the parent offset may not be describing the offset into the text node
					// if so, we need to correct for this.
					if (currentNode !== currentPos.parent) {
						const child = currentPos.parent.childAfter(currentPos.parentOffset - 1);
						if (child.node === currentNode) {
							parentOffset -= child.offset;
						}
					}
					const nextChIndex = parentOffset;
					const nextCh = currentLine.length > nextChIndex ? currentLine.charAt(nextChIndex) : ' ';
					const prevChars = currentLine.substring(0, parentOffset);
					const startIndex = prevChars.lastIndexOf(' ') + 1;
					const startLetter = currentLine.charAt(startIndex);
					const charsAreCorrect = startLetter === '/' && nextCh.charCodeAt(0) === 32;
					const substring = currentLine.substring(startIndex + 1, nextChIndex) || '';
					const start = currentPos.pos - parentOffset + startIndex;
					const end = currentPos.pos - parentOffset + startIndex + 1 + substring.length;
					return {
						isActive: sel.empty && canUse && charsAreCorrect,
						start: start,
						end: end,
						positionNumber: currentPos.pos,
						parentOffset: sel.$to.parentOffset,
						emptyLine: currentLine.length === 0,
						substring: substring,
					};
				},
			},
			props: {
				handleDOMEvents: {
					keydown: (view, evt)=> {
						const state = pluginKey.getState(view.state);
						if (state && state.isActive && evt.type === 'keydown' && (evt.keyCode === 38 || evt.keyCode === 40  || evt.keyCode === 13)) {
							evt.preventDefault();
							return true;
						}
						return false;
					},
				},
			}
		})];
	}
	constructor(props) {
		super(props);

		this.state = {
			isActive: false,
			start: 0,
			end: 0,
			opacity: 0,
			top: 0,
			left: 0,
			substring: '',
			activeMenuItem: 0,
			activeMenuItems: getMenuItems(this.props.view)
		};
		this.onKeyEvents = this.onKeyEvents.bind(this);
		this.onChange = this.onChange.bind(this);
		this.replaceContent = this.replaceContent.bind(this);
	}
	componentDidMount() {
		window.addEventListener('keydown', this.onKeyEvents);
	}
	componentWillReceiveProps(nextProps) {
		if (this.props.editorState !== nextProps.editorState) {
			this.onChange();
		}
	}
	componentWillUnmount() {
		window.removeEventListener('keydown', this.onKeyEvents);
	}

	onKeyEvents(evt) {
		if (!this.state.isActive) { return null; }
		if (evt.keyCode === 38) { // ArrowUp
			return this.setState({ activeMenuItem: Math.max(this.state.activeMenuItem - 1, 0) });
		}
		if (evt.keyCode === 40) { // ArrowDown
			return this.setState({ activeMenuItem: Math.min(this.state.activeMenuItem + 1, this.state.activeMenuItems.length - 1) });
		}
		if (evt.keyCode === 13) { // Enter
			return this.replaceContent(this.state.activeMenuItems[this.state.activeMenuItem].run);
		}
		return null;
	}

	onChange() {
		const container = document.getElementById(this.props.containerId);
		const viewState = this.props.pluginKey.getState(this.props.view.state);
		if (!viewState) { return null; }
		const coordsAtPos = this.props.view.coordsAtPos(viewState.positionNumber);
		const boundRect = container.getBoundingClientRect();
		return this.setState({
			isActive: viewState.isActive,
			start: viewState.start,
			end: viewState.end,
			opacity: viewState.parentOffset === 0 && viewState.emptyLine ? 0.5 : 0,
			top: coordsAtPos.top - boundRect.top,
			left: coordsAtPos.left - boundRect.left,
			substring: viewState.substring,
			activeMenuItems: getMenuItems(this.props.view).filter((item)=> {
				return fuzzysearch(viewState.substring.replace('/', '').toLowerCase(), item.label.toLowerCase());
			})
		});
	}

	replaceContent(itemRunFunc) {
		const transaction = this.props.view.state.tr.delete(this.state.start, this.state.end);
		this.props.view.dispatch(transaction);
		itemRunFunc();
		this.setState({
			activeMenuItem: 0,
			activeMenuItems: getMenuItems(this.props.view)
		});
	}

	render() {
		const menuStyle = {
			left: `${this.state.left + 2}px`,
			top: this.state.top,
		};
		const helperStyle = {
			opacity: this.state.opacity,
		};
		if (this.state.isActive) {
			return (
				<div className={'pt-menu pt-elevation-1 insert-popup'} style={menuStyle}>
					<div className={'pt-menu-item pt-disabled'}>Type to filter</div>
					{this.state.activeMenuItems.sort((foo, bar)=> {
						if (foo.label < bar.label) { return -1; }
						if (foo.label > bar.label) { return 1; }
						return 0;
					}).map((item, index)=> {
						return (
							<div
								className={`pt-menu-item ${this.state.activeMenuItem === index ? 'pt-active' : ''} ${item.icon || ''}`}
								key={`menu-item-${item.label}`}
								onClick={()=> { this.replaceContent(item.run); }}
								role={'button'}
								tabIndex={-1}
							>
								Insert {item.label}
							</div>
						);
					})}
				</div>
			);
		}

		return (
			<div className={'insert-menu'} style={menuStyle}>
				<p style={helperStyle} className={'insert-helper'}>Type '/' to insert...</p>
			</div>
		);
	}
}

InsertMenu.propTypes = propTypes;
InsertMenu.defaultProps = defaultProps;
export default InsertMenu;
