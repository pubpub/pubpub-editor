import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { NodeSelection } from 'prosemirror-state';

require('./citationAddon.scss');

const propTypes = {
	value: PropTypes.string.isRequired,
	html: PropTypes.string.isRequired,
	count: PropTypes.number.isRequired,
	formatFunction: PropTypes.func.isRequired,
	isSelected: PropTypes.bool.isRequired,
	view: PropTypes.object.isRequired,
	updateAttrs: PropTypes.func.isRequired,
};

class CitationEditable extends Component {
	constructor(props) {
		super(props);
		this.handleValueChange = this.handleValueChange.bind(this);
		this.handleHTMLChange = this.handleHTMLChange.bind(this);
		this.refocusNode = this.refocusNode.bind(this);
	}
	handleValueChange(evt) {
		this.props.updateAttrs({ value: evt.target.value });
		this.refocusNode();
		this.props.formatFunction(evt.target.value, this.handleHTMLChange);
	}
	handleHTMLChange(html) {
		this.props.updateAttrs({ html: html });
		this.refocusNode();
		this.inputElem.focus();
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
			<div className={`citation-wrapper ${this.props.isSelected ? 'selected' : ''}`}>
				<div className={'render-wrapper'}>
					<span className={'citation editable-render'}>[{this.props.count}]</span>

					{this.props.isSelected &&
						<div className={'options-wrapper pt-card pt-elevation-2'}>
							<div className={'rendered-citation'} dangerouslySetInnerHTML={{ __html: this.props.html }} />

							<div className={'input-wrapper'}>
								<div className={'input-title'}>Input</div>
								<textarea
									ref={(refElem)=> { this.inputElem = refElem; }}
									placeholder={'Enter bibtex, DOI, wikidata url, or bibjson...'}
									className={'pt-input pt-fill'}
									value={this.props.value}
									onChange={this.handleValueChange}
								/>
							</div>
						</div>
					}
				</div>
			</div>

		);
	}
}

CitationEditable.propTypes = propTypes;
export default CitationEditable;
