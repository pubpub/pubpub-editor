import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { NodeSelection } from 'prosemirror-state';
// import katex from 'katex';

require('./latexAddon.scss');

const propTypes = {
	value: PropTypes.string.isRequired,
	html: PropTypes.string.isRequired,
	renderFunction: PropTypes.func.isRequired,
	isBlock: PropTypes.bool.isRequired,
	isSelected: PropTypes.bool.isRequired,
	view: PropTypes.object.isRequired,
	updateAttrs: PropTypes.func.isRequired,
	changeNode: PropTypes.func.isRequired,
};

class LatexEditable extends Component {
	constructor(props) {
		super(props);
		this.state = { html: props.html };
		// this.generateHTML = this.generateHTML.bind(this);
		this.handleValueChange = this.handleValueChange.bind(this);
		this.handleHTMLChange = this.handleHTMLChange.bind(this);
		this.changeToInline = this.changeToInline.bind(this);
		this.changeToBlock = this.changeToBlock.bind(this);
		this.refocusNode = this.refocusNode.bind(this);
	}

	// componentWillReceiveProps(nextProps) {
	// 	if (this.props.value !== nextProps.value) {
	// 		const text = nextProps.value;
	// 		const displayHTML = this.generateHTML(text);
	// 		this.setState({ displayHTML });
	// 	}
	// }
	componentWillReceiveProps(nextProps) {
		if (this.props.isSelected && !nextProps.isSelected) {
			this.props.updateAttrs({ html: this.state.html });
		}
	}

	// generateHTML(text) {
	// 	this.props.renderFunction(text, this.props.isBlock);
	// 	// try {
	// 	// 	return katex.renderToString(text, { displayMode: this.props.isBlock });
	// 	// } catch (err) {
	// 	// 	return '<div class="pub-latex-error">Error rendering equation</div>';
	// 	// }
	// }
	changeToInline() {
		this.props.changeNode(this.props.view.state.schema.nodes.equation, {
			value: this.props.value
		}, null);
		this.refocusNode();
	}

	changeToBlock() {
		this.props.changeNode(this.props.view.state.schema.nodes.block_equation, {
			value: this.props.value
		}, null);
		this.refocusNode(1);
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

	render() {
		return (
			<div className={`latex-wrapper ${this.props.isBlock ? 'block' : ''} ${this.props.isSelected ? 'selected' : ''}`}>
				<div className={'render-wrapper'}>
					<span
						className={'editable-render'}
						dangerouslySetInnerHTML={{ __html: this.state.html }}
					/>
					{this.props.isSelected &&
						<div className={'options-wrapper'}>
							<div className={'top-row'}>
								<div className={'pt-button-group pt-minimal'}>
									<button
										className={`pt-button pt-icon-align-left ${!this.props.isBlock ? 'pt-active' : ''}`}
										onClick={this.changeToInline}
									/>
									<button
										className={`pt-button pt-icon-align-justify ${this.props.isBlock ? 'pt-active' : ''}`}
										onClick={this.changeToBlock}
									/>
								</div>
							</div>
							<textarea
								placeholder={'Enter LaTeX math'}
								className={'pt-input pt-fill'}
								value={this.props.value}
								onChange={this.handleValueChange}
							/>
						</div>
					}
				</div>
			</div>

		);
	}
}

LatexEditable.propTypes = propTypes;
export default LatexEditable;
