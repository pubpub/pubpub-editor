import React, { Component } from 'react';
import PropTypes from 'prop-types';

require('./selectionCite.scss');

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

class SelectionCite extends Component {
	constructor(props) {
		super(props);
		this.state = {
			top: null,
			left: 0,
		};
		this.onChange = this.onChange.bind(this);
		this.handleMouseDown = this.handleMouseDown.bind(this);
		this.handleClick = this.handleClick.bind(this);
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
		if (!view.state.selection.$cursor && currentNode && currentNode.text) {
			const currentFromPos = view.state.selection.$from.pos;
			const currentToPos = view.state.selection.$to.pos;
			const left = view.coordsAtPos(currentFromPos).left - container.getBoundingClientRect().left;
			const right = view.coordsAtPos(currentToPos).right - container.getBoundingClientRect().left;
			const inlineCenter = left + ((right - left) / 2);
			const inlineTop = view.coordsAtPos(currentFromPos).top - container.getBoundingClientRect().top;
			return this.setState({
				left: inlineCenter,
				top: inlineTop,
			});
		}

		return this.setState({
			left: 0,
			top: null,
			input: null,
		});
	}

	handleMouseDown(evt) {
		// This is to prevent losing focus on menu click
		evt.preventDefault();
	}

	handleClick() {
		console.log('Clicked it');
		this.props.view.focus();
	}

	render() {
		const padding = 5;
		const width = 50;
		// const width = 327;
		const wrapperStyle = {
			display: this.state.top !== null ? 'block' : 'none',
			top: Math.max(this.state.top - 40, 0),
			width: `${width}px`,
			left: Math.max(this.state.left - (width / 2), 0),
			padding: `0px ${padding}px`
		};
		return (
			<div className={'selection-cite'} style={wrapperStyle} onMouseDown={this.handleMouseDown}>
				<div
					role={'button'}
					tabIndex={-1}
					className={'button pt-icon-bookmark'}
					onClick={this.handleClick}
				/>
			</div>
		);
	}
}

SelectionCite.propTypes = propTypes;
SelectionCite.defaultProps = defaultProps;
export default SelectionCite;
