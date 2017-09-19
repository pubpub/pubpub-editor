import React, { Component } from 'react';
import PropTypes from 'prop-types';

const propTypes = {
	node: PropTypes.object.isRequired,
	view: PropTypes.object.isRequired,
	decorations: PropTypes.array.isRequired,
	forceSelection: PropTypes.func.isRequired,
	updateAttrs: PropTypes.func.isRequired,
	updateContent: PropTypes.func.isRequired,
	changeNode: PropTypes.func.isRequired,
	renderComponent: PropTypes.func.isRequired,
};


class ReactViewWrapper extends Component {
	constructor(props) {
		super(props);
		this.state = {
			isSelected: false,
		};
		this.forceSelection = this.forceSelection.bind(this);
		this.setSelected = this.setSelected.bind(this);
	}

	setSelected(isSelected) {
		this.setState({ isSelected });
	}

	forceSelection(evt) {
		if (!this.state.selected) {
			this.props.forceSelection();
		}
		evt.preventDefault();
	}

	render() {
		const { renderComponent, node, view, decorations } = this.props;
		const helperFunctions = {
			updateAttrs: this.props.updateAttrs,
			changeNode: this.props.changeNode,
			updateContent: this.props.updateContent,
		};
		return (
			<span role={'button'} tabIndex={-1} onClick={this.forceSelection}>
				{renderComponent(node, view, decorations, this.state.isSelected, helperFunctions)}
			</span>
		);
	}
}

ReactViewWrapper.propTypes = propTypes;
export default ReactViewWrapper;
