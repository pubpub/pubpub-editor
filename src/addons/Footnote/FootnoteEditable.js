import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { NodeSelection } from 'prosemirror-state';

require('./footnote.scss');

const propTypes = {
	value: PropTypes.string.isRequired,
	count: PropTypes.number.isRequired,
	isSelected: PropTypes.bool.isRequired,
	view: PropTypes.object.isRequired,
	updateAttrs: PropTypes.func.isRequired,
};

class FootnoteEditable extends Component {
	constructor(props) {
		super(props);
		this.handleValueChange = this.handleValueChange.bind(this);
		this.refocusNode = this.refocusNode.bind(this);
	}
	handleValueChange(evt) {
		this.props.updateAttrs({ value: evt.target.value });
		this.refocusNode();
	}
	refocusNode() {
		const view = this.props.view;
		const pos = view.state.selection.from;
		const sel = NodeSelection.create(view.state.doc, pos);
		const transaction = view.state.tr.setSelection(sel);
		view.dispatch(transaction);
	}

	render() {
		return (
			<div className={`footnote-wrapper ${this.props.isSelected ? 'selected' : ''}`}>
				<div className={'render-wrapper'}>
					<sup className={'footnote editable-render'}>{this.props.count}</sup>

					{this.props.isSelected &&
						<div className={'options-wrapper pt-card pt-elevation-2'}>
							<textarea
								placeholder={'Enter footnote...'}
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

FootnoteEditable.propTypes = propTypes;
export default FootnoteEditable;
