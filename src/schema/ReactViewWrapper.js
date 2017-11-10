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
	getPos: PropTypes.func.isRequired,
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

	setSelected = (isSelected) => {
		this.setState({ isSelected });
	}

	forceSelection = (evt) => {
		if (!this.state.isSelected) {
			this.setState({ isSelected: true });
			this.props.forceSelection();
		}
		/* I commented this out because file inputs werent' working. */
		/* If we get weird behavior elsewhere, we can revisit */
		// evt.preventDefault();
		evt.stopPropagation();
	}

	focusAndSelect = () => {
		this.setState({ isSelected: true });
		this.rootElem.focus();
	}

	render() {
		const { renderComponent, node, view, decorations } = this.props;
		const helperFunctions = {
			updateAttrs: this.props.updateAttrs,
			changeNode: this.props.changeNode,
			updateContent: this.props.updateContent,
			getPos: this.props.getPos,
		};
		return (
			<span
				ref={(elem) => { this.rootElem = elem; }}
				draggable="false"
				onClick={this.forceSelection}
				/* These following parameters mess with the cursor behavior over nodeviews */
				// role={'textbox'}
				// tabIndex={-1}
			>
				{renderComponent(node, view, decorations, this.state.isSelected, helperFunctions)}
			</span>
		);
	}
}

ReactViewWrapper.propTypes = propTypes;
export default ReactViewWrapper;
