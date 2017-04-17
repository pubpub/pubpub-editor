import { Button, EditableText, Popover, PopoverInteractionKind, Position } from '@blueprintjs/core';
import Radium, { Style } from 'radium';
import React, { PropTypes } from 'react';

import ReactDOM from 'react-dom';

export const HTMLEditor = React.createClass({
	propTypes: {
		value: PropTypes.string,
		updateValue: PropTypes.func,
		forceSelection: PropTypes.func,
	},
	getInitialState: function() {
		return {
			editing: false,
		};
	},

	getDefaultProps: function() {
		return { };
	},


	forceSelection: function(evt) {
		if (!this.state.selected) {
			this.props.forceSelection();
		}
		evt.preventDefault();
	},

	changeToEditing: function() {
		const clientWidth = ReactDOM.findDOMNode(this.refs.latexElem).getBoundingClientRect().width;
		this.setState({ editing: true, clientWidth });
		setTimeout(() => this.refs.input.focus(), 10);
	},

	changeToNormal: function() {
		const value = this.state.value || this.props.value;
		const displayHTML= this.generateHTML(value);
		this.props.updateValue(value);
		this.setState({ editing: false, displayHTML, value: null });
	},

	handleChange: function(event) {
		const value = event.target.value;
		this.setState({ value });
		this.forceUpdate();
		// this.props.updateValue(value);
	},

	handleKeyPress: function(evt) {
		if (evt.key === 'Enter' && !this.props.block) {
			this.changeToNormal();
		}
	},

	setSelected: function(selected) {
		this.setState({ selected });
	},


	renderDisplay() {
		const { displayHTML, selected, closePopOver } = this.state;
		const { block, content } = this.props;

		return (
			<span onClick={this.forceSelection}>
				<span
					ref={'htmlElem'}
					className={'pub-embed-html'}
          dangerouslySetInnerHTML={{__html: content}}/>
			</span>
		);
	},

	renderEdit() {
		// const { clientWidth } = this.state;
		const { block } = this.props;

		const value = this.state.value || this.props.value;

		const popoverContent = (
			<div>
				<Button iconName="annotation" onClick={this.changeToNormal}>Save</Button>
			</div>
		);

		return (
			<span style={{ position: 'relative' }} onClick={this.forceSelection}>
				{block
					? <Popover
						content={popoverContent}
						defaultIsOpen={true}
						interactionKind={PopoverInteractionKind.CLICK}
						popoverClassName={''}
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
	},

	render: function() {
		const { editing } = this.state;

		if (editing) { return this.renderEdit(); }
		return this.renderDisplay();
	}

});

export default HTMLEditor;
