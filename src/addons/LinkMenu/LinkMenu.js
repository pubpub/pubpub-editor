import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Plugin } from 'prosemirror-state';
import { Overlay } from '@blueprintjs/core';

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
						start: undefined,
						end: undefined,
						mark: undefined,
					};
				},
				apply(transaction, state, prevEditorState, editorState) {
					const type = editorState.schema.marks.link;
					const { from, $from, empty, $to } = editorState.selection;
					const start = editorState.doc.resolve(from + 1);
					const end = $to;
					const isLink = empty
						? type.isInSet(start.marks()) || type.isInSet(end.marks())
						: type.isInSet(start.marks()) && type.isInSet(end.marks());

					if (!isLink) {
						return {
							start: undefined,
							end: undefined,
							mark: undefined,
						};
					}

					let startPos = from - 1;
					let foundStart = false;
					while (!foundStart) {
						if (startPos === 0) { foundStart = true; }
						if (editorState.doc.rangeHasMark(startPos, startPos + 1, type)) {
							startPos -= 1;
						} else {
							foundStart = true;
						}
					}
					let endPos = from;
					let foundEnd = false;
					while (!foundEnd) {
						if (endPos === 0) { foundEnd = true; }
						if (editorState.doc.rangeHasMark(endPos, endPos + 1, type)) {
							endPos += 1;
						} else {
							foundEnd = true;
						}
					}


					const markBefore = $from.nodeBefore && $from.nodeBefore.marks.reduce((prev, curr)=> {
						if (curr.type.name === 'link') { return curr; }
						return prev;
					}, undefined);
					const markAfter = $from.nodeAfter && $from.nodeAfter.marks.reduce((prev, curr)=> {
						if (curr.type.name === 'link') { return curr; }
						return prev;
					}, undefined);

					return {
						start: startPos,
						end: endPos,
						mark: markBefore || markAfter,
					};
				},
			}
		})];
	}

	constructor(props) {
		super(props);

		this.state = {
			recievedStart: undefined,
			recievedEnd: undefined,
			recievedMark: undefined,
			newHref: '',
		};
		this.container = document.getElementById(props.containerId);
		this.onChange = this.onChange.bind(this);
		this.onOverlaySubmit = this.onOverlaySubmit.bind(this);
		this.onOverlayClose = this.onOverlayClose.bind(this);
		this.removeLink = this.removeLink.bind(this);
		this.cancelChange = this.cancelChange.bind(this);
	}

	componentWillReceiveProps(nextProps) {
		if (this.props.editorState !== nextProps.editorState) {
			this.onChange();
		}
	}

	onChange() {
		const viewState = this.props.pluginKey.getState(this.props.view.state);
		if (!viewState) { return null; }
		const boundingCoords = this.container.getBoundingClientRect();
		const coordsAtPos = viewState.start
			? this.props.view.coordsAtPos(viewState.start + 1)
			: undefined;
		const href = viewState.mark ? viewState.mark.attrs.href : '';
		return this.setState({
			recievedStart: viewState.start,
			recievedEnd: viewState.end,
			recievedMark: viewState.mark,
			boundingCoords: boundingCoords,
			coords: coordsAtPos,
			newHref: href,
		});
	}

	onOverlayClose() {
		this.setState({
			editOptionsOpen: false,
			coords: undefined,
			newHref: '',
		});
		setTimeout(()=> {
			/* This timeout seems to be necessary for Prosemirror to actually capture focus. */
			this.props.view.focus();
		}, 1);
	}

	removeLink() {
		const transaction = this.props.view.state.tr;
		transaction.removeMark(
			this.state.recievedStart + 1,
			this.state.recievedEnd,
			this.props.view.state.schema.marks.link,
		);
		this.props.view.dispatch(transaction);
		this.onOverlayClose();
	}
	cancelChange() {
		if (!this.state.recievedMark.attrs.href) {
			this.removeLink();
		} else {
			this.onOverlayClose();
		}
	}
	onOverlaySubmit(evt) {
		evt.preventDefault();
		const oldNodeAttrs = this.state.recievedMark.attrs;
		const formattedHref = this.state.newHref.indexOf(':') > -1
			? this.state.newHref
			: `http://${this.state.newHref}`;
		const transaction = this.props.view.state.tr;
		transaction.removeMark(
			this.state.recievedStart + 1,
			this.state.recievedEnd,
			this.props.view.state.schema.marks.link,
		);
		transaction.addMark(
			this.state.recievedStart + 1,
			this.state.recievedEnd,
			this.props.view.state.schema.marks.link.create({ ...oldNodeAttrs, href: formattedHref }),
		);
		this.props.view.dispatch(transaction);
		this.onOverlayClose();
	}

	render() {
		const coords = this.state.coords || {};
		const boundingCoords = this.state.boundingCoords || {};
		const style = {
			display: coords.bottom ? 'block' : 'none',
			top: coords.bottom - boundingCoords.top,
			left: coords.left - boundingCoords.left,
		};
		const href = this.state.recievedMark ? this.state.recievedMark.attrs.href : '';
		const emptyMark = this.state.recievedMark && !href;
		return (
			<div className="link-menu" style={style}>
				{!this.state.editOptionsOpen && !emptyMark &&
					<div className="pt-elevation-2" >
						<span className="link">
							<a href={href} target="_blank">{href}</a>
						</span>
						<span> - </span>
						<button
							className="pt-button pt-minimal"
							type="button"
							onClick={()=> {
								this.setState({ editOptionsOpen: true });
							}}
						>
							Change
						</button>
						<button type="button" className="pt-button pt-minimal" onClick={this.removeLink}>
							Remove
						</button>		
					</div>
				}

				<Overlay
					isOpen={this.state.editOptionsOpen || emptyMark}
					onClose={this.onOverlayClose}
				>
					<div className="overlay-wrapper pt-card pt-elevation-2">
						<form onSubmit={this.onOverlaySubmit}>
							<input
								type="text"
								value={this.state.newHref}
								onChange={(evt)=> {
									this.setState({ newHref: evt.target.value });
								}}
								ref={(inputRef)=> {
									if (inputRef) { inputRef.focus(); }
								}}
							/>
							<button
								type="button"
								className="pt-button pt-intent-danger"
								onClick={this.cancelChange}
							>
								Cancel
							</button>
							<button
								type="submit"
								className="pt-button pt-intent-success"
								onClick={this.onOverlaySubmit}
							>
								Save
							</button>
						</form>
					</div>
				</Overlay>
			</div>
		);
	}
}

LinkMenu.propTypes = propTypes;
LinkMenu.defaultProps = defaultProps;
export default LinkMenu;
