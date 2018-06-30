import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { NodeSelection } from 'prosemirror-state';
import { Portal } from 'react-portal';
import SimpleEditor from '../../SimpleEditor';

require('./footnote.scss');

const propTypes = {
	value: PropTypes.string.isRequired,
	count: PropTypes.number.isRequired,
	isSelected: PropTypes.bool.isRequired,
	view: PropTypes.object.isRequired,
	updateAttrs: PropTypes.func.isRequired,
	onOptionsRender: PropTypes.func.isRequired,
	optionsContainerRef: PropTypes.object.isRequired,
};

class FootnoteEditable extends Component {
	constructor(props) {
		super(props);
		// this.handleValueChange = this.handleValueChange.bind(this);
		// this.refocusNode = this.refocusNode.bind(this);
		this.portalRefFunc = this.portalRefFunc.bind(this);
	}
	// handleValueChange(htmlString) {
	// 	this.props.updateAttrs({ value: htmlString });
	// 	// this.refocusNode();
	// }

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
			<div className={`footnote-wrapper ${this.props.isSelected ? 'selected' : ''}`}>
				<div className={'render-wrapper'}>
					<sup className={'footnote editable-render'}>{this.props.count}</sup>

					{/*this.props.isSelected &&
						<div className={'options-wrapper pt-card pt-elevation-2'}>
							<textarea
								placeholder={'Enter footnote...'}
								className={'pt-input pt-fill'}
								value={this.props.value}
								onChange={this.handleValueChange}
							/>
						</div>
					*/}
				</div>
				{this.props.isSelected &&
					<Portal 
						ref={this.portalRefFunc} 
						node={this.props.optionsContainerRef.current}
					>
						<div className="options-box">
							<div className="options-title">Footnote Details</div>
							
							{/*  Content Adjustment */}
							<label className="form-label">
								Content
							</label>
							<div className="simple-editor-wrapper">
								<SimpleEditor
									initialHtmlString={this.props.value}
									onChange={(htmlString)=> {
										this.props.updateAttrs({ value: htmlString });
									}}
								/>
							</div>
						</div>
					</Portal>
				}
			</div>

		);
	}
}

FootnoteEditable.propTypes = propTypes;
export default FootnoteEditable;
