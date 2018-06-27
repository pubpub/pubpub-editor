import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Plugin } from 'prosemirror-state';
import { Overlay } from '@blueprintjs/core';
// import fuzzysearch from 'fuzzysearch';
// import { getMenuItems, canUseLinkMenu } from './LinkMenuConfig';

require('./linkMenu.scss');

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
* Allows control and editing of links
*
* @example
return (
	<Editor>
		<ILinkMenu />
	</Editor>
);
*/
class LinkMenu extends Component {
	static pluginName = 'LinkMenu';
	static getPlugins({ pluginKey }) {
		return [new Plugin({
			key: pluginKey,
			state: {
				init() {
					return {
						// isActive: false,
						start: undefined,
						href: undefined,
						// end: 0,
						// positionNumber: 0,
						// parentOffset: 0,
						// emptyLine: false,
						// substring: '',
					};
				},
				apply(transaction, state, prevEditorState, editorState) {
					const type = editorState.schema.marks.link;
					console.log(type);
					// const { from, $from, to, empty } = state.selection;
					const { from, $from, empty, $to } = editorState.selection;
					let isLink = false;
					const start = editorState.doc.resolve(from + 1);
					const end = $to;
					if (empty) {
						isLink = type.isInSet(start.marks()) || type.isInSet(end.marks());
					} else {
						isLink = type.isInSet(start.marks()) && type.isInSet(end.marks());
					}

					let href;
					let startPos;
					console.log('from', from);
					if (isLink) {
						startPos = from - 1;
						let foundStart = false;
						// debugger;
						while (!foundStart) {
							console.log('rangehas mark', editorState.doc.rangeHasMark(startPos, startPos, type));
							if (startPos === 0) { foundStart = true; }
							if (editorState.doc.rangeHasMark(startPos, startPos + 1, type)) {
								startPos -= 1;
								console.log('In here');
							} else {
								foundStart = true;
							}
						}

						href = $from.nodeBefore && $from.nodeBefore.marks.reduce((prev, curr)=> {
							if (curr.type.name === 'link') { return curr.attrs.href; }
							return prev;
						}, '');

						// if (href) {
						// 	const elemWrapper = document.createElement('span');
						// 	elemWrapper.className = 'prosemirror-link-url';
						// 	const elemStyle = document.createElement('style');
						// 	elemStyle.innerHTML = `.prosemirror-link-url:after { content: "${href}"; display: block; }`;
						// 	elemWrapper.appendChild(elemStyle);
						// 	return DecorationSet.create(state.doc, [Decoration.widget(startPos, elemWrapper)]);
						// }
						// if (!href) {
						// 	const elemWrapper = document.createElement('input');
						// 	elemWrapper.className = 'prosemirror-link-url-input';
						// 	// const elemStyle = document.createElement('style');
						// 	// elemWrapper.innerHTML = "yippie";
						// 	// elemWrapper.appendChild(elemStyle);
						// 	elemWrapper.focus();
						// 	return DecorationSet.create(state.doc, [Decoration.widget(startPos, elemWrapper)]);
						// }
						// https://discuss.prosemirror.net/t/editing-link-targets/1203/2
					};
					console.log(startPos);
					return {
						start: startPos,
						href: href,
					};


					// const doc = editorState.doc;
					// const emptyDoc = doc.childCount === 0 || (doc.childCount === 1 && doc.firstChild.isTextblock && doc.firstChild.content.size === 0);
					// if (emptyDoc) { return null; }

					// const canUse = canUseLinkMenu(editorState);
					// const sel = editorState.selection;
					// const currentPos = sel.$to;
					// const currentNode = editorState.doc.nodeAt(currentPos.pos - 1);
					// const text = currentNode && currentNode.textContent ? currentNode.textContent : '';
					// const currentLine = text.replace(/\s/g, ' ');
					// let parentOffset = currentPos.parentOffset;
					// // sometimes the parent offset may not be describing the offset into the text node
					// // if so, we need to correct for this.
					// if (currentNode !== currentPos.parent) {
					// 	const child = currentPos.parent.childAfter(currentPos.parentOffset - 1);
					// 	if (child.node === currentNode) {
					// 		parentOffset -= child.offset;
					// 	}
					// }
					// const nextChIndex = parentOffset;
					// const nextCh = currentLine.length > nextChIndex ? currentLine.charAt(nextChIndex) : ' ';
					// const prevChars = currentLine.substring(0, parentOffset);
					// const startIndex = prevChars.lastIndexOf(' ') + 1;
					// const startLetter = currentLine.charAt(startIndex);
					// const charsAreCorrect = startLetter === '/' && nextCh.charCodeAt(0) === 32;
					// const substring = currentLine.substring(startIndex + 1, nextChIndex) || '';
					// const start = currentPos.pos - parentOffset + startIndex;
					// const end = currentPos.pos - parentOffset + startIndex + 1 + substring.length;
					// return {
					// 	isActive: sel.empty && canUse && charsAreCorrect,
					// 	start: start,
					// 	end: end,
					// 	positionNumber: currentPos.pos,
					// 	parentOffset: sel.$to.parentOffset,
					// 	emptyLine: currentLine.length === 0,
					// 	substring: substring,
					// };
				},
			},
			// props: {
			// 	handleDOMEvents: {
			// 		keydown: (view, evt)=> {
			// 			const state = pluginKey.getState(view.state);
			// 			if (state && state.isActive && evt.type === 'keydown' && (evt.keyCode === 38 || evt.keyCode === 40  || evt.keyCode === 13)) {
			// 				evt.preventDefault();
			// 				return true;
			// 			}
			// 			return false;
			// 		},
			// 	},
			// }
		})];
	}



	constructor(props) {
		super(props);

		this.state = {
			recievedStart: undefined,
			recievedHref: undefined,
		// 	isActive: false,
		// 	start: 0,
		// 	end: 0,
		// 	opacity: 0,
		// 	top: 0,
		// 	left: 0,
		// 	substring: '',
		// 	activeMenuItem: 0,
		// 	activeMenuItems: getMenuItems(this.props.view)
		};
		this.container = document.getElementById(props.containerId);
		// this.onKeyEvents = this.onKeyEvents.bind(this);
		this.onChange = this.onChange.bind(this);
		// this.replaceContent = this.replaceContent.bind(this);
	}
	// componentDidMount() {
	// 	window.addEventListener('keydown', this.onKeyEvents);
	// }
	componentWillReceiveProps(nextProps) {
		if (this.props.editorState !== nextProps.editorState) {
			console.log(this.props.view);
			this.onChange();
		}
	}
	// componentWillUnmount() {
	// 	window.removeEventListener('keydown', this.onKeyEvents);
	// }

	// onKeyEvents(evt) {
	// 	if (!this.state.isActive) { return null; }
	// 	if (evt.keyCode === 38) { // ArrowUp
	// 		return this.setState({ activeMenuItem: Math.max(this.state.activeMenuItem - 1, 0) });
	// 	}
	// 	if (evt.keyCode === 40) { // ArrowDown
	// 		return this.setState({ activeMenuItem: Math.min(this.state.activeMenuItem + 1, this.state.activeMenuItems.length - 1) });
	// 	}
	// 	if (evt.keyCode === 13) { // Enter
	// 		return this.replaceContent(this.state.activeMenuItems[this.state.activeMenuItem].run);
	// 	}
	// 	return null;
	// }

	onChange() {
		// const container = document.getElementById(this.props.containerId);
		const viewState = this.props.pluginKey.getState(this.props.view.state);
		if (!viewState) { return null; }
		console.log(viewState);
		const boundingCoords = this.container.getBoundingClientRect();
		const coordsAtPos = viewState.start
			? this.props.view.coordsAtPos(viewState.start + 1)
			: undefined;
		// console.log(coordsAtPos);
		// const boundRect = container.getBoundingClientRect();
		return this.setState({
			// isActive: viewState.isActive,
			recievedStart: viewState.start,
			recievedHref: viewState.href,
			boundingCoords: boundingCoords,
			coords: coordsAtPos,
			// end: viewState.end,
			// opacity: viewState.parentOffset === 0 && viewState.emptyLine ? 0.5 : 0,
			// top: coordsAtPos.top - boundRect.top,
			// left: coordsAtPos.left - boundRect.left,
			// substring: viewState.substring,
			// activeMenuItems: getMenuItems(this.props.view).filter((item)=> {
			// 	return fuzzysearch(viewState.substring.replace('/', '').toLowerCase(), item.label.toLowerCase());
			// })
		});
	}

	// replaceContent(itemRunFunc) {
	// 	const transaction = this.props.view.state.tr.delete(this.state.start, this.state.end);
	// 	this.props.view.dispatch(transaction);
	// 	itemRunFunc();
	// 	this.setState({
	// 		activeMenuItem: 0,
	// 		activeMenuItems: getMenuItems(this.props.view)
	// 	});
	// }

	render() {
		console.log(this.state.coords);
		const coords = this.state.coords || {};
		const boundingCoords = this.state.boundingCoords || {};
		const style = {
			display: coords.bottom ? 'block' : 'none',
			top: coords.bottom - boundingCoords.top,
			left: coords.left - boundingCoords.left,
		};
		console.log(this.props.view);
		return (
			<div className="link-menu pt-elevation-2" style={style}>
				<span className="link">{this.state.href}href</span>
				<span> - </span>
				<button className="pt-button pt-minimal" onClick={()=> {this.setState({editOptionsOpen: true});}}>Change</button>
				<button className="pt-button pt-minimal">Remove</button>


				<Overlay
					isOpen={this.state.editOptionsOpen}
					onClose={()=> { this.setState({ editOptionsOpen: false, coords: undefined }); }}
				>
					<div className="overlay-wrapper pt-card pt-elevation-2">
						<textarea defaultValue={'Hello'} ref={(thingy)=> { if (this.state.editOptionsOpen) {thingy.focus();} }}></textarea>
						<button className="pt-button pt-intent-success" onClick={()=> {
							// this.props.updateAttrs({
							// 	caption: String(Math.random()),
							// 	size: Math.floor(Math.random() * 100),
							// });
							this.setState({ editOptionsOpen: false, coords: undefined });
							// window.getSelection().removeAllRanges();
							// this.props.view.focus();
							/* This timeout seems to be necessary for Prosemirror to actually capture focus. */
							setTimeout(()=> {
								this.props.view.focus();
							}, 1);
						}}>Save</button>
					</div>
				</Overlay>
			</div>
		);
	}
}

LinkMenu.propTypes = propTypes;
LinkMenu.defaultProps = defaultProps;
export default LinkMenu;


// import { Plugin } from 'prosemirror-state';
// import { DecorationSet, Decoration } from 'prosemirror-view';

// const linkPlugin = new Plugin({
// 	props: {
// 		decorations(state) {
// 			const type = state.schema.marks.link;
// 			// const { from, $from, to, empty } = state.selection;
// 			const { from, $from, empty, $to } = state.selection;
// 			let isLink = false;
// 			const start = state.doc.resolve(from + 1);
// 			const end = $to;
// 			if (empty) {
// 				isLink = type.isInSet(start.marks()) || type.isInSet(end.marks());
// 			} else {
// 				isLink = type.isInSet(start.marks()) && type.isInSet(end.marks());
// 			}

// 			if (isLink) {
// 				let startPos = from - 1;
// 				let foundStart = false;
// 				while (!foundStart) {
// 					if (startPos === 0) { foundStart = true; }
// 					if (state.doc.rangeHasMark(startPos, startPos, type)) {
// 						startPos -= 1;
// 					} else {
// 						foundStart = true;
// 					}
// 				}

// 				const href = $from.nodeBefore && $from.nodeBefore.marks.reduce((prev, curr)=> {
// 					if (curr.type.name === 'link') { return curr.attrs.href; }
// 					return prev;
// 				}, '');

// 				if (href) {
// 					const elemWrapper = document.createElement('span');
// 					elemWrapper.className = 'prosemirror-link-url';
// 					const elemStyle = document.createElement('style');
// 					elemStyle.innerHTML = `.prosemirror-link-url:after { content: "${href}"; display: block; }`;
// 					elemWrapper.appendChild(elemStyle);
// 					return DecorationSet.create(state.doc, [Decoration.widget(startPos, elemWrapper)]);
// 				}
// 				if (!href) {
// 					const elemWrapper = document.createElement('input');
// 					elemWrapper.className = 'prosemirror-link-url-input';
// 					// const elemStyle = document.createElement('style');
// 					// elemWrapper.innerHTML = "yippie";
// 					// elemWrapper.appendChild(elemStyle);
// 					elemWrapper.focus();
// 					return DecorationSet.create(state.doc, [Decoration.widget(startPos, elemWrapper)]);
// 				}
// 				// https://discuss.prosemirror.net/t/editing-link-targets/1203/2
// 			}
// 			return null;
// 		}
// 	}
// });

// export default linkPlugin;
