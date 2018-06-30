import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { NodeSelection } from 'prosemirror-state';
import { Portal } from 'react-portal';
import SimpleEditor from '../../SimpleEditor';

require('./citation.scss');

const propTypes = {
	value: PropTypes.string.isRequired,
	html: PropTypes.string.isRequired,
	count: PropTypes.number.isRequired,
	formatFunction: PropTypes.func.isRequired,
	isSelected: PropTypes.bool.isRequired,
	view: PropTypes.object.isRequired,
	updateAttrs: PropTypes.func.isRequired,
	onOptionsRender: PropTypes.func,
	optionsContainerRef: PropTypes.object,
};

class CitationEditable extends Component {
	constructor(props) {
		super(props);
		this.handleValueChange = this.handleValueChange.bind(this);
		this.handleHTMLChange = this.handleHTMLChange.bind(this);
		this.portalRefFunc = this.portalRefFunc.bind(this);
	}
	handleValueChange(evt) {
		this.props.updateAttrs({ value: evt.target.value });
		this.props.formatFunction(evt.target.value, this.handleHTMLChange);
	}
	handleHTMLChange(html) {
		this.props.updateAttrs({ html: html });
	}

	portalRefFunc(elem) {
		/* Used to call onOptioneRender so that optionsBox can be placed */
		if (elem) {
			const domAtPos = this.props.view.domAtPos(this.props.view.state.selection.from);
			const nodeDom = domAtPos.node.childNodes[domAtPos.offset];
			this.props.onOptionsRender(nodeDom, this.props.optionsContainerRef.current);
		}
	}

	render() {
		return (
			<span className="citation-wrapper">
				<span className={`render-wrapper ${this.props.isSelected ? 'isSelected' : ''}`}>
					<span className="citation">[{this.props.count}]</span>
				</span>

				{this.props.isSelected &&
					<Portal 
						ref={this.portalRefFunc} 
						node={this.props.optionsContainerRef.current}
					>
						<div className="options-box">
							<div className="options-title">Citation Details</div>
							
							{/*  Content Adjustment */}
							<label className="form-label">
								Structured Data
							</label>
							<textarea
								placeholder="Enter bibtex, DOI, wikidata url, or bibjson..."
								className="pt-input pt-fill"
								value={this.props.value}
								onChange={this.handleValueChange}
							/>

							{/*  Output */}
							<label className="form-label">
								Data Output
							</label>
							<div className="rendered-citation" dangerouslySetInnerHTML={{ __html: this.props.html }} />
						</div>
					</Portal>
				}
			</span>

		);
	}
}

CitationEditable.propTypes = propTypes;
export default CitationEditable;
