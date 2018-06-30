import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Portal } from 'react-portal';
import { NodeSelection } from 'prosemirror-state';

require('./latex.scss');

const propTypes = {
	value: PropTypes.string.isRequired,
	html: PropTypes.string.isRequired,
	renderFunction: PropTypes.func.isRequired,
	isBlock: PropTypes.bool.isRequired,
	isSelected: PropTypes.bool.isRequired,
	view: PropTypes.object.isRequired,
	updateAttrs: PropTypes.func.isRequired,
	changeNode: PropTypes.func.isRequired,
	onOptionsRender: PropTypes.func.isRequired,
	optionsContainerRef: PropTypes.object.isRequired,
};

class LatexEditable extends Component {
	constructor(props) {
		super(props);
		this.state = { html: props.html };
		this.handleValueChange = this.handleValueChange.bind(this);
		this.handleHTMLChange = this.handleHTMLChange.bind(this);
		this.changeToInline = this.changeToInline.bind(this);
		this.changeToBlock = this.changeToBlock.bind(this);
		this.refocusNode = this.refocusNode.bind(this);
		this.portalRefFunc = this.portalRefFunc.bind(this);
	}

	componentWillReceiveProps(nextProps) {
		if (this.props.isSelected && !nextProps.isSelected) {
			this.props.updateAttrs({ html: this.state.html });
		}
	}

	changeToInline() {
		if (this.props.isBlock) {
			this.props.changeNode(this.props.view.state.schema.nodes.equation, {
				value: this.props.value,
				html: this.state.html,
			}, null);
			this.refocusNode();	
		}
	}

	changeToBlock() {
		if (!this.props.isBlock) {
			this.props.changeNode(this.props.view.state.schema.nodes.block_equation, {
				value: this.props.value,
				html: this.state.html,
			}, null);
			this.refocusNode(1);
		}
	}

	handleValueChange(evt) {
		this.props.updateAttrs({ value: evt.target.value, html: this.state.html });
		if (!this.props.isBlock) {
			this.refocusNode();
		}
		this.props.renderFunction(evt.target.value, this.props.isBlock, this.handleHTMLChange);
	}

	handleHTMLChange(html) {
		this.setState({ html: html });
		/* This is a bit funky, but to avoid losing cursor position on */
		/* an asynchronous update, we use setState to display new HTML. */
		/* This means that the node attrs still has an HTML value that is one-behind. */
		/* On deselect of the node, we fire an updateAttrs to make sure */
		/* that last value is synced to attrs. */
	}

	refocusNode(offset = 0) {
		const view = this.props.view;
		const pos = view.state.selection.from + offset;
		const sel = NodeSelection.create(view.state.doc, pos);
		const transaction = view.state.tr.setSelection(sel);
		view.dispatch(transaction);
	}

	portalRefFunc(elem) {
		/* Used to call onOptioneRender so that optionsBox can be placed */
		if (elem) {
			const domAtPos = this.props.view.domAtPos(this.props.view.state.selection.from);
			const nodeDom = domAtPos.node.childNodes[domAtPos.offset];
			this.props.onOptionsRender(nodeDom, this.props.optionsContainerRef.current);
		}
	}

	render() {
		return (
			<div className={`latex-wrapper ${this.props.isBlock ? 'block' : ''}`}>
				<div className={`render-wrapper ${this.props.isSelected ? 'isSelected' : ''}`}>
					<span
						className={'editable-render'}
						dangerouslySetInnerHTML={{ __html: this.state.html }}
					/>
				</div>
				{this.props.isSelected &&
					<Portal 
						ref={this.portalRefFunc} 
						node={this.props.optionsContainerRef.current}
					>
						<div className="options-box">
							<div className="options-title">Math Details</div>

							{/*  LaTex Adjustment */}
							<label className="form-label">
								LaTeX
							</label>
							<textarea
								placeholder={'Enter LaTeX math'}
								className={'pt-input pt-fill'}
								value={this.props.value}
								onChange={this.handleValueChange}
							/>
							
							{/*  Display Adjustment */}
							<label className="form-label">
								Display
							</label>
							<div className={'pt-button-group pt-fill'}>
								<button
									className={`pt-button pt-icon-align-left ${!this.props.isBlock ? 'pt-active' : ''}`}
									onClick={this.changeToInline}
								>
									Inline
								</button>
								<button
									className={`pt-button pt-icon-align-justify ${this.props.isBlock ? 'pt-active' : ''}`}
									onClick={this.changeToBlock}
								>
									Block
								</button>
							</div>
						</div>
					</Portal>
				}
			</div>

		);
	}
}

LatexEditable.propTypes = propTypes;
export default LatexEditable;
