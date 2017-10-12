import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { NodeSelection } from 'prosemirror-state';
// import ReactDOM from 'react-dom';
// import { Button, EditableText, Popover, PopoverInteractionKind, Position } from '@blueprintjs/core';
import katex from 'katex';

require('./latexAddon.scss');

const propTypes = {
	value: PropTypes.string.isRequired,
	isBlock: PropTypes.bool.isRequired,
	isSelected: PropTypes.bool.isRequired,
	view: PropTypes.object.isRequired,
	updateAttrs: PropTypes.func.isRequired,
	changeNode: PropTypes.func.isRequired,
};

class LatexEditable extends Component {
	constructor(props) {
		super(props);
		this.state = {
			// editing: false,
			value: null,
			displayHTML: this.generateHTML(this.props.value)
		};
		// this.changeToEditing = this.changeToEditing.bind(this);
		// this.changeToDisplay = this.changeToDisplay.bind(this);
		// this.handleChange = this.handleChange.bind(this);
		this.generateHTML = this.generateHTML.bind(this);
		this.handleValueChange = this.handleValueChange.bind(this);
		// this.handleKeyPress = this.handleKeyPress.bind(this);
		this.changeToInline = this.changeToInline.bind(this);
		this.changeToBlock = this.changeToBlock.bind(this);
		this.refocusNode = this.refocusNode.bind(this);
		// this.renderDisplay = this.renderDisplay.bind(this);
		// this.renderEdit = this.renderEdit.bind(this);
	}

	componentWillReceiveProps(nextProps) {
		// if (this.props.isBlock !== nextProps.isBlock) {
		// 	this.setState({ closePopOver: false });
		// }
		if (this.props.value !== nextProps.value) {
			const text = nextProps.value;
			// if (!this.state.editing) {
			const displayHTML = this.generateHTML(text);
			this.setState({ displayHTML });
			// }
		}
	}

	// changeToEditing() {
	// 	const clientWidth = ReactDOM.findDOMNode(this.refs.latexElem).getBoundingClientRect().width;
	// 	this.setState({ editing: true, clientWidth });
	// 	setTimeout(() => this.refs.input.focus(), 10);
	// }

	// changeToDisplay() {
	// 	const value = this.state.value || this.props.value;
	// 	const displayHTML = this.generateHTML(value);
	// 	// this.props.helperFunctions.updateContent(value);
	// 	this.setState({ editing: false, displayHTML, value: null });
	// }

	// handleChange(event) {
	// 	const value = event.target.value;
	// 	this.setState({ value });
	// 	this.forceUpdate();
	// 	// this.props.updateValue(value);
	// }

	generateHTML(text) {
		try {
			return katex.renderToString(text, { displayMode: this.props.isBlock });
		} catch (err) {
			return '<div class="pub-latex-error">Error rendering equation</div>';
		}
	}

	// handleKeyPress(evt) {
	// 	if (evt.key === 'Enter' && !this.props.isBlock) {
	// 		this.changeToDisplay();
	// 	}
	// }


	changeToInline() {
		// this.setState({ closePopOver: true });
		this.props.changeNode(this.props.view.state.schema.nodes.equation, { value: this.props.value }, null);
		this.refocusNode();
	}

	changeToBlock() {
		// this.setState({ closePopOver: true });
		this.props.changeNode(this.props.view.state.schema.nodes.block_equation, { value: this.props.value }, null);
		this.refocusNode(1);
	}
	handleValueChange(evt) {
		this.props.updateAttrs({ value: evt.target.value });
		if (!this.props.isBlock) {
			this.refocusNode();
		}
	}
	refocusNode(offset = 0) {
		const view = this.props.view;
		const pos = view.state.selection.from + offset;
		const sel = NodeSelection.create(view.state.doc, pos);
		const transaction = view.state.tr.setSelection(sel);
		view.dispatch(transaction);
	}

	// renderDisplay() {
	// 	const { displayHTML, closePopOver } = this.state;
	// 	const { isBlock, value } = this.props;

	// 	const selected = this.props.isSelected;
	// 	const popoverContent = (
	// 		<div className="pt-button-group pt-minimal">
	// 			<Button iconName="annotation" onClick={this.changeToEditing}>Edit</Button>
	// 			{!isBlock
	// 				? <Button iconName="maximize" onClick={this.changeToBlock}>Block</Button>
	// 				: <Button iconName="minimize" onClick={this.changeToInline}>Inline</Button>
	// 			}
	// 		</div>
	// 	);

	// 	const isPopOverOpen = (closePopOver) ? false : undefined;

	// 	return (
	// 		<span>
	// 			<Popover
	// 				content={popoverContent}
	// 				isOpen={isPopOverOpen}
	// 				interactionKind={PopoverInteractionKind.CLICK}
	// 				className={'blockPopover'}
	// 				popoverClassName={'pt-minimal pt-dark'}
	// 				position={Position.BOTTOM}
	// 				useSmartPositioning={false}>

	// 				<span
	// 					ref={'latexElem'}
	// 					className={('pub-embed-latex' + ((selected) ? ' selected' : ''))}
	// 					dangerouslySetInnerHTML={{__html: displayHTML}}
	// 				/>
	// 			</Popover>
	// 		</span>
	// 	);
	// }

	// renderEdit() {
	// 	// const { clientWidth } = this.state;
	// 	const { isBlock } = this.props;

	// 	const value = this.state.value || this.props.value;

	// 	const popoverContent = (
	// 		<div>
	// 			<Button iconName="annotation" onClick={this.changeToDisplay}>Save</Button>
	// 		</div>
	// 	);

	// 	return (
	// 		<span style={{ position: 'relative' }}>
	// 			{isBlock
	// 				? <Popover
	// 					content={popoverContent}
	// 					defaultIsOpen={true}
	// 					interactionKind={PopoverInteractionKind.CLICK}
	// 					popoverClassName={'pt-minimal pt-dark'}
	// 					position={Position.BOTTOM}
	// 					autoFocus={false}
	// 					enforceFocus={false}
	// 					useSmartPositioning={false}>
	// 					<div className="pt-input-group">
	// 						<span className="pt-icon pt-icon-function" />
	// 						<textarea
	// 							ref="input"
	// 							type="text"
	// 							className="pt-input"
	// 							placeholder="Enter equation..."
	// 							onChange={this.handleChange}
	// 							value={value} />
	// 					</div>
	// 				</Popover>
	// 				: <span>
	// 					<span className="pt-icon pt-icon-function" />
	// 					<input
	// 						ref="input"
	// 						type="text"
	// 						className="pt-input"
	// 						placeholder="Enter equation..."
	// 						onChange={this.handleChange}
	// 						onKeyPress={this.handleKeyPress}
	// 						style={{ width: 'auto' }}
	// 						value={value} />
	// 				</span>
	// 			}
	// 		</span>
	// 	);
	// }

	render() {
		// const { editing } = this.state;
		// console.log(this.props.isSelected);
		// if (editing) { return this.renderEdit(); }
		// return this.renderDisplay();

		return (
			<div className={`latex-wrapper ${this.props.isBlock ? 'block' : ''} ${this.props.isSelected ? 'selected' : ''}`}>
				<div className={'render-wrapper'}>
					<span
						className={'editable-render'}
						dangerouslySetInnerHTML={{ __html: this.state.displayHTML }}
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
