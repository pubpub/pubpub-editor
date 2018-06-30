import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Plugin } from 'prosemirror-state';
import { Portal } from 'react-portal';

require('./linkMenu.scss');

const propTypes = {
	containerId: PropTypes.string,
	view: PropTypes.object,
	editorState: PropTypes.object,
	pluginKey: PropTypes.object,
	onOptionsRender: PropTypes.func.isRequired,
	optionsContainerRef: PropTypes.object.isRequired,
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
					const linkMarkType = editorState.schema.marks.link;
					const { from, $from, to, $to, empty } = editorState.selection;
					const shiftedFrom = editorState.doc.resolve(from - 1);
					const shiftedTo = editorState.doc.resolve(to - 1);

					/* Because we set link marks to not be inclusive, we need to do */
					/* some shifted so the dialog will appear at the start and end */
					/* of the link text */
					const marksAcross = empty
						? $from.marksAcross($to).length ? $from.marksAcross($to) : shiftedFrom.marksAcross(shiftedTo)
						: $from.marksAcross(shiftedTo);

					const activeLinkMark = marksAcross.reduce((prev, curr)=> {
						if (curr.type.name === 'link') { return curr; }
						return prev;
					}, undefined);

					if (!activeLinkMark) {
						return {
							start: undefined,
							end: undefined,
							mark: undefined,
						};
					}

					/* Note - this start and end will cause directly adjacent */
					/* links to be merged into a single link on edit. Adjacent */
					/* links with different URLs seems like a worse UI experience */
					/* than having two links merge on edit. So, perhaps we simply */
					/* leave this 'bug'. We can revisit later. */
					let startPos = from - 1;
					let foundStart = false;
					while (!foundStart) {
						if (startPos === 0) { foundStart = true; }
						if (editorState.doc.rangeHasMark(startPos, startPos + 1, linkMarkType)) {
							startPos -= 1;
						} else {
							foundStart = true;
						}
					}
					let endPos = from;
					let foundEnd = false;
					while (!foundEnd) {
						if (endPos === 0) { foundEnd = true; }
						if (editorState.doc.rangeHasMark(endPos, endPos + 1, linkMarkType)) {
							endPos += 1;
						} else {
							foundEnd = true;
						}
					}

					return {
						start: startPos,
						end: endPos,
						mark: activeLinkMark,
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
		};
		this.updateAttrs = this.updateAttrs.bind(this);
		this.portalRefFunc = this.portalRefFunc.bind(this);
	}

	componentWillReceiveProps(nextProps) {
		if (this.props.editorState !== nextProps.editorState) {
			const viewState = this.props.pluginKey.getState(this.props.view.state);
			return this.setState({
				recievedMark: viewState.mark,
				recievedStart: viewState.start,
				recievedEnd: viewState.end,
			});
		}
	}

	updateAttrs(newAttrs) {
		const oldNodeAttrs = this.state.recievedMark.attrs;
		const transaction = this.props.view.state.tr;
		transaction.removeMark(
			this.state.recievedStart + 1,
			this.state.recievedEnd,
			this.props.view.state.schema.marks.link,
		);
		transaction.addMark(
			this.state.recievedStart + 1,
			this.state.recievedEnd,
			this.props.view.state.schema.marks.link.create({ ...oldNodeAttrs, ...newAttrs }),
		);
		this.props.view.dispatch(transaction);
	}

	portalRefFunc(elem) {
		/* Used to call onOptioneRender so that optionsBox can be placed */
		if (elem) {
			const domAtPos = this.props.view.domAtPos(this.props.view.state.selection.from);
			const nodeDom = domAtPos.node.childNodes[domAtPos.offset];
			if (nodeDom) {
				this.props.onOptionsRender(nodeDom, this.props.optionsContainerRef.current);	
			}
		}
	}

	render() {
		const mark = this.state.recievedMark;
		const markHref = mark ? mark.attrs.href : '';
		const formattedHref = markHref.indexOf(':') > -1
			? markHref
			: `http://${markHref}`;
		return (
			<div className="link-menu">
				{mark &&
					<Portal 
						ref={this.portalRefFunc} 
						node={this.props.optionsContainerRef.current}
					>
						<div className="options-box">
							<div className="options-title">Link Details</div>
							
							{/*  URL Adjustment */}
							<label className="form-label">
								URL
							</label>
							<input
								type="text"
								className="pt-input pt-fill"
								value={mark.attrs.href}
								onChange={(evt)=> {
									this.updateAttrs({ href: evt.target.value });
								}}
							/>

							<a
								target="_blank"
								rel="noopener noreferrer"
								href={formattedHref}
								className="preview-href"
							>
								{formattedHref}
							</a>
						</div>
					</Portal>
				}
			</div>
		);
	}
}

LinkMenu.propTypes = propTypes;
LinkMenu.defaultProps = defaultProps;
export default LinkMenu;
