import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Portal } from 'react-portal';
import { AnchorButton, Slider } from '@blueprintjs/core';
import SimpleEditor from '../../SimpleEditor';

require('./iframe.scss');

const propTypes = {
	// node: PropTypes.object,
	// view: PropTypes.object,
	caption: PropTypes.string.isRequired,
	url: PropTypes.string,
	align: PropTypes.oneOf(['full', 'left', 'right', 'center']).isRequired,
	size: PropTypes.number.isRequired, // Number as percentage width
	height: PropTypes.number, // Number as pixel height
	isSelected: PropTypes.bool,
	updateAttrs: PropTypes.func.isRequired,
	onOptionsRender: PropTypes.func.isRequired,
	optionsContainerRef: PropTypes.object.isRequired,
};

const defaultProps = {
	node: {},
	url: '',
	size: 50,
	height: 419,
	isSelected: false,
	view: {},
};

class IframeEditable extends Component {
	constructor(props) {
		super(props);
		this.state = {
			isResizing: false,
		};
		this.randKey = Math.round(Math.random() * 99999);
		this.updateUrl = this.updateUrl.bind(this);
		this.updateCaption = this.updateCaption.bind(this);
		this.updateAlign = this.updateAlign.bind(this);
		this.portalRefFunc = this.portalRefFunc.bind(this);
	}

	updateUrl(evt) {
		this.props.updateAttrs({ url: evt.target.value });
	}

	updateCaption(evt) {
		this.props.updateAttrs({ caption: evt.target.value });
	}

	updateAlign(val) {
		this.props.updateAttrs({ align: val });
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
		const alignOptions = [
			{ key: 'left', icon: 'pt-icon-align-left' },
			{ key: 'center', icon: 'pt-icon-align-center' },
			{ key: 'right', icon: 'pt-icon-align-right' },
			{ key: 'full', icon: 'pt-icon-vertical-distribution' },
		];
		const figFloat = this.props.align === 'left' || this.props.align === 'right' ? this.props.align : 'none';
		let figMargin = '0em auto 1em';
		if (this.props.align === 'left') { figMargin = '1em 1em 1em 0px'; }
		if (this.props.align === 'right') { figMargin = '1em 0px 1em 1em'; }
		const figWidth = this.props.align === 'full' ? '100%' : `${this.props.size}%`;
		const figStyle = {
			width: figWidth,
			margin: figMargin,
			float: figFloat,
		};

		return (
			<div className={'figure-wrapper editable'}>
				<figure className={`iframe ${this.props.isSelected ? 'isSelected' : ''}`} style={figStyle}>
					{this.props.url &&
						<iframe
							title={`iFrame of ${this.props.url}`}
							src={this.props.url}
							height={`${this.props.height}px`}
							allowFullScreen
							frameBorder={'0'}
						/>
					}
					{!this.props.url &&
						<label htmlFor={`new-${this.randKey}`} className={'empty-iframe'}>
							Enter Source URL
						</label>
					}
					<figcaption dangerouslySetInnerHTML={{ __html: this.props.caption }} />
				</figure>
				{this.props.isSelected &&
					<Portal 
						ref={this.portalRefFunc} 
						node={this.props.optionsContainerRef.current}
					>
						<div className="options-box">
							<div className="options-title">Iframe Details</div>
							{/*  Size Adjustment */}
							<label className="form-label">
								Size
							</label>
							<Slider
								min={25}
								max={100}
								value={this.props.size}
								onChange={(newSize)=> {
									this.props.updateAttrs({ size: newSize });
								}}
								labelRenderer={false}
								disabled={this.props.align === 'full'}
							/>

							{/*  Height Adjustment */}
							<label className="form-label">
								Height
							</label>
							<Slider
								min={150}
								max={800}
								value={this.props.height}
								onChange={(newHeight)=> {
									this.props.updateAttrs({ height: newHeight });
								}}
								labelRenderer={false}
							/>
							
							{/*  Alignment Adjustment */}
							<label className="form-label">
								Alignment
							</label>
							<div className="pt-button-group pt-fill">
								{alignOptions.map((item)=> {
									return (
										<button
											key={`align-option-${item.key}`}
											className={`pt-button ${item.icon} ${this.props.align === item.key ? 'pt-active' : ''}`}
											onClick={()=> { this.updateAlign(item.key); }}
										/>
									);
								})}
							</div>
							
							{/*  Caption Adjustment */}
							<label className="form-label">
								Caption
							</label>
							<div className="simple-editor-wrapper">
								<SimpleEditor
									initialHtmlString={this.props.caption}
									onChange={(htmlString)=> {
										this.props.updateAttrs({ caption: htmlString });
									}}
								/>
							</div>

							{/*  Source Details */}
							<label className="form-label">
								Source
							</label>
							<textarea
								className={'pt-input pt-fill'}
								value={this.props.url}
								onChange={this.updateUrl}
								placeholder={'Enter URL'}
							/>
						</div>
					</Portal>
				}
			</div>
		);
	}
}

IframeEditable.propTypes = propTypes;
IframeEditable.defaultProps = defaultProps;
export default IframeEditable;
