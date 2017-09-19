import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import { Button, EditableText, Popover, PopoverInteractionKind, Position } from '@blueprintjs/core';
import katex from 'katex';

require('./latex.scss');

const propTypes = {
	value: PropTypes.string.isRequired,
	isBlock: PropTypes.bool.isRequired,
	isSelected: PropTypes.bool.isRequired,
	view: PropTypes.object.isRequired,
	helperFunctions: PropTypes.object.isRequired,
};

class LatexEditable extends Component {
	constructor(props) {
		super(props);
		this.state = {
			editing: false,
			value: null,
			displayHTML: this.generateHTML(this.props.value)
		};
		this.changeToEditing = this.changeToEditing.bind(this);
		this.changeToDisplay = this.changeToDisplay.bind(this);
		this.handleChange = this.handleChange.bind(this);
		this.generateHTML = this.generateHTML.bind(this);
		this.handleKeyPress = this.handleKeyPress.bind(this);
		this.changeToInline = this.changeToInline.bind(this);
		this.changeToBlock = this.changeToBlock.bind(this);
		this.renderDisplay = this.renderDisplay.bind(this);
		this.renderEdit = this.renderEdit.bind(this);
	}

	componentWillReceiveProps(nextProps) {
		if (this.props.isBlock !== nextProps.isBlock) {
			this.setState({ closePopOver: false });
		}
		if (this.props.value !== nextProps.value) {
			const text = nextProps.value;
			if (!this.state.editing) {
				const displayHTML = this.generateHTML(text);
				this.setState({ displayHTML });
			}
		}
	}

	changeToEditing() {
		const clientWidth = ReactDOM.findDOMNode(this.refs.latexElem).getBoundingClientRect().width;
		this.setState({ editing: true, clientWidth });
		setTimeout(() => this.refs.input.focus(), 10);
	}

	changeToDisplay() {
		const value = this.state.value || this.props.value;
		const displayHTML = this.generateHTML(value);
		this.props.helperFunctions.updateContent(value);
		this.setState({ editing: false, displayHTML, value: null });
	}

	handleChange(event) {
		const value = event.target.value;
		this.setState({ value });
		this.forceUpdate();
		// this.props.updateValue(value);
	}

	generateHTML(text) {
		try {
			return katex.renderToString(text, { displayMode: this.props.isBlock });
		} catch (err) {
			return "<div class='pub-latex-error'>Error rendering equation</div>";
		}
	}

	handleKeyPress(evt) {
		if (evt.key === 'Enter' && !this.props.isBlock) {
			this.changeToDisplay();
		}
	}


	changeToInline() {
		this.setState({ closePopOver: true });
		this.props.helperFunctions.changeNode(this.props.view.state.schema.nodes.equation, { content: this.props.value }, null);
	}

	changeToBlock() {
		this.setState({ closePopOver: true });
		this.props.helperFunctions.changeNode(this.props.view.state.schema.nodes.block_equation, { content: this.props.value }, null);
	}

	renderDisplay() {
		const { displayHTML, closePopOver } = this.state;
		const { isBlock, value } = this.props;

		const selected = this.props.isSelected;
		const popoverContent = (
			<div className="pt-button-group pt-minimal">
				<Button iconName="annotation" onClick={this.changeToEditing}>Edit</Button>
				{!isBlock
					? <Button iconName="maximize" onClick={this.changeToBlock}>Block</Button>
					: <Button iconName="minimize" onClick={this.changeToInline}>Inline</Button>
				}
			</div>
		);

		const isPopOverOpen = (closePopOver) ? false : undefined;

		return (
			<span>
				<Popover
					content={popoverContent}
					isOpen={isPopOverOpen}
					interactionKind={PopoverInteractionKind.CLICK}
					className={'blockPopover'}
					popoverClassName={'pt-minimal pt-dark'}
					position={Position.BOTTOM}
					useSmartPositioning={false}>

					<span
						ref={'latexElem'}
						className={('pub-embed-latex' + ((selected) ? ' selected' : ''))}
						dangerouslySetInnerHTML={{__html: displayHTML}}
					/>
				</Popover>
			</span>
		);
	}

	renderEdit() {
		// const { clientWidth } = this.state;
		const { isBlock } = this.props;

		const value = this.state.value || this.props.value;

		const popoverContent = (
			<div>
				<Button iconName="annotation" onClick={this.changeToDisplay}>Save</Button>
			</div>
		);

		return (
			<span style={{ position: 'relative' }}>
				{isBlock
					? <Popover
						content={popoverContent}
						defaultIsOpen={true}
						interactionKind={PopoverInteractionKind.CLICK}
						popoverClassName={'pt-minimal pt-dark'}
						position={Position.BOTTOM}
						autoFocus={false}
						enforceFocus={false}
						useSmartPositioning={false}>
						<div className="pt-input-group">
							<span className="pt-icon pt-icon-function" />
							<textarea
								ref="input"
								type="text"
								className="pt-input"
								placeholder="Enter equation..."
								onChange={this.handleChange}
								value={value} />
						</div>
					</Popover>
					: <span>
						<span className="pt-icon pt-icon-function" />
						<input
							ref="input"
							type="text"
							className="pt-input"
							placeholder="Enter equation..."
							onChange={this.handleChange}
							onKeyPress={this.handleKeyPress}
							style={{ width: 'auto' }}
							value={value} />
					</span>
				}
			</span>
		);
	}

	render() {
		const { editing } = this.state;

		if (editing) { return this.renderEdit(); }
		return this.renderDisplay();
	}

}

LatexEditable.propTypes = propTypes;
export default LatexEditable;
