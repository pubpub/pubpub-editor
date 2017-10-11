import React, { Component } from 'react';

import PropTypes from 'prop-types';
import getMenuItems from './formattingMenuConfig';

require('./formattingMenu.scss');

const propTypes = {
	containerId: PropTypes.string,
	view: PropTypes.object,
	editorState: PropTypes.object,
};

const defaultProps = {
	containerId: undefined,
	view: undefined,
	editorState: undefined,
};


/**
 * @module Addons
 */

/**
 * @component
 *
 * Displays a formatting menu for inline operation such as bold, italics, etc. when a user selects some text.
 * The options are not currently configurable by other add-ons in the way that the InsertMenu addon is.
 * @example
 * return <Editor placeholder="Please start typing">
 		<FormattingMenu/>
	</Editor>
 */
class FormattingMenu extends Component {
	constructor(props) {
		super(props);
		this.state = {
			input: null,
			top: 0,
			left: 0,
		};
		this.onChange = this.onChange.bind(this);
		this.startInput = this.startInput.bind(this);
		this.submitInput = this.submitInput.bind(this);
		this.handleMouseDown = this.handleMouseDown.bind(this);
	}

	componentWillReceiveProps(nextProps) {
		if (this.props.editorState !== nextProps.editorState) {
			this.onChange();
		}
	}

	onChange() {
		const { view, containerId } = this.props;
		const currentPos = view.state.selection.$to.pos;
		if (currentPos === 0) { return null; }
		const currentNode = view.state.doc.nodeAt(currentPos - 1);
		const container = document.getElementById(containerId);
		console.log('In on change');
		if (!view.state.selection.$cursor && currentNode && currentNode.text) {
			const currentFromPos = view.state.selection.$from.pos;
			const currentToPos = view.state.selection.$to.pos;
			const left = view.coordsAtPos(currentFromPos).left - container.getBoundingClientRect().left;
			const right = view.coordsAtPos(currentToPos).right - container.getBoundingClientRect().left;
			const inlineCenter = left + ((right - left) / 2);
			const inlineTop = view.coordsAtPos(currentFromPos).top - container.getBoundingClientRect().top;
			console.log('got a selection');
			return this.setState({
				left: inlineCenter,
				top: inlineTop,
			});
		}

		return this.setState({
			left: 0,
			top: 0,
			input: null,
		});
	}

	startInput(type, run) {
		this.setState({ input: 'text', run });
		console.log(run);
	}

	submitInput(evt) {
		if (evt.key === 'Enter') {
			const link = this.textInput.value;
			this.state.run({ href: link });
			this.setState({ input: null, run: null, top: 0, });
			// console.log('view', this.props.view);
			this.props.view.focus();
		}
	}

	handleMouseDown(evt) {
		// This is to prevent losing focus on menu click
		evt.preventDefault();
	}

	render() {
		const menuItems = getMenuItems(this.props.view);
		const width = 327;
		const wrapperStyle = {
			display: this.state.top ? 'block' : 'none',
			top: Math.max(this.state.top - 40, 0),
			width: `${width}px`,
			left: Math.max(this.state.left - (width / 2), 0),
		};

		if (this.state.input === 'text') {
			return (
				<div
					role={'button'}
					tabIndex={-1}
					onKeyPress={this.submitInput}
					className={'formatting-menu input'}
					style={wrapperStyle}
				>
					<input
						ref={(input) => { this.textInput = input; if (input) { input.focus(); } }}
						type="text"
						placeholder={'Enter URL...'}
						className={'pt-input'}
						dir="auto"
					/>
				</div>
			);
		}

		return (
			<div className={'formatting-menu'} style={wrapperStyle} onMouseDown={this.handleMouseDown}>
				{menuItems.map((item)=> {
					let onClick;
					if (item.input === 'text' && !item.isActive) {
						onClick = ()=> {
							this.startInput.bind(this, item.input, item.run)();
							this.props.view.focus();
						};
					} else {
						onClick = ()=> {
							item.run();
							this.props.view.focus();
						};
					}
					return (
						<div
							role={'button'}
							tabIndex={-1}
							key={`menuItem-${item.icon}`}
							className={`button ${item.icon} ${item.isActive ? 'active' : ''}`}
							onClick={onClick}
						/>
					);
				})}

			</div>
		);
	}
}

FormattingMenu.propTypes = propTypes;
FormattingMenu.defaultProps = defaultProps;
export default FormattingMenu;
