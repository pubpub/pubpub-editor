import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { AnchorButton } from '@blueprintjs/core';

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
		this.onDragMouseDown = this.onDragMouseDown.bind(this);
		this.onDragMouseUp = this.onDragMouseUp.bind(this);
		this.onMouseMove = this.onMouseMove.bind(this);
		this.updateUrl = this.updateUrl.bind(this);
		this.updateCaption = this.updateCaption.bind(this);
		this.updateAlign = this.updateAlign.bind(this);
	}

	onDragMouseDown(evt) {
		const handle = evt.target.className.replace('drag-handle ', '');
		this.setState({ isResizing: handle });
		document.addEventListener('mousemove', this.onMouseMove);
		document.addEventListener('mouseup', this.onDragMouseUp);
	}
	onDragMouseUp() {
		this.setState({ isResizing: false });
		document.removeEventListener('mousemove', this.onMouseMove);
		document.removeEventListener('mouseup', this.onDragMouseUp);
	}
	onMouseMove(evt) {
		const iframeBounding = this.iframeElem.getBoundingClientRect();
		if (this.state.isResizing === 'bottom') {
			const bottomDragBounding = this.bottomDragElem.getBoundingClientRect();
			const delta = evt.clientY - bottomDragBounding.bottom;
			const currentHeight = iframeBounding.height;
			const nextSize = Math.max(Math.round(currentHeight + delta), 100);
			this.props.updateAttrs({ height: nextSize });
		} else {
			const delta = this.state.isResizing === 'left'
				? iframeBounding.left - evt.clientX
				: evt.clientX - iframeBounding.right;
			const maxWidth = this.rootElem.clientWidth;
			const currentWidth = iframeBounding.width;
			const nextSize = Math.min(
				Math.max(
					Math.round(((currentWidth + delta) / maxWidth) * 100),
					20
				),
				100
			);
			this.props.updateAttrs({ size: nextSize });
		}
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
			<div className={'iframe-figure-wrapper editable'} ref={(rootElem)=> { this.rootElem = rootElem; }}>
				<figure className={`iframe ${this.props.isSelected ? 'isSelected' : ''}`} style={figStyle}>
					{this.props.isSelected && this.props.url && this.props.align !== 'full' &&
						<div>
							<div className={'drag-handle left'} onMouseDown={this.onDragMouseDown} role={'button'} tabIndex={-1} />
							<div className={'drag-handle right'} onMouseDown={this.onDragMouseDown} role={'button'} tabIndex={-1} />
						</div>
					}
					{this.props.isSelected && this.props.url &&
						<div className={'drag-handle bottom'} onMouseDown={this.onDragMouseDown} role={'button'} tabIndex={-1} ref={(bottomDragElem)=> { this.bottomDragElem = bottomDragElem; }} />
					}
					{this.props.url &&
						<iframe
							ref={(iframeElem)=> { this.iframeElem = iframeElem; }}
							title={`iFrame of ${this.props.url}`}
							src={this.props.url}
							height={`${this.props.height}px`}
							allowFullScreen
							frameBorder={'0'}
						/>
					}
					{!this.props.url &&
						<label htmlFor={`new-${this.randKey}`} className={'empty-iframe'}>
							Enter URL below
						</label>
					}
					{!this.props.isSelected && this.props.url &&
						<figcaption>
							{this.props.caption}
						</figcaption>
					}
					{(this.props.isSelected || !this.props.url) &&
						<div className={'options-wrapper'}>
							<div className={'top-row'}>
								<div className={'pt-button-group pt-minimal'}>
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
							</div>
							<input
								type={'text'}
								className={'pt-input pt-fill'}
								value={this.props.url}
								onChange={this.updateUrl}
								placeholder={'Enter URL'}
							/>
							<input
								type={'text'}
								placeholder={'Add Caption'}
								className={'pt-input pt-fill'}
								value={this.props.caption}
								onChange={this.updateCaption}
							/>
						</div>
					}
				</figure>
			</div>
		);
	}
}

IframeEditable.propTypes = propTypes;
IframeEditable.defaultProps = defaultProps;
export default IframeEditable;
