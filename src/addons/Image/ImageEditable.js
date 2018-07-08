import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { AnchorButton } from '@blueprintjs/core';

require('./image.scss');

const propTypes = {
	// node: PropTypes.object,
	// view: PropTypes.object,
	caption: PropTypes.string.isRequired,
	url: PropTypes.string,
	align: PropTypes.oneOf(['full', 'left', 'right', 'center']).isRequired,
	size: PropTypes.number.isRequired, // Number as percentage width
	isSelected: PropTypes.bool,
	onFileUpload: PropTypes.func.isRequired,
	updateAttrs: PropTypes.func.isRequired,
	handleResizeUrl: PropTypes.func
};

const defaultProps = {
	node: {},
	url: '',
	isSelected: false,
	view: {},
	handleResizeUrl: undefined,
};

class ImageEditable extends Component {
	constructor(props) {
		super(props);
		this.state = {
			isResizing: false,
			uploading: false,
			imageBlob: null,
		};
		this.randKey = Math.round(Math.random() * 99999);
		this.onDragMouseDown = this.onDragMouseDown.bind(this);
		this.onDragMouseUp = this.onDragMouseUp.bind(this);
		this.onMouseMove = this.onMouseMove.bind(this);
		this.updateCaption = this.updateCaption.bind(this);
		this.updateAlign = this.updateAlign.bind(this);
		this.handleImageSelect = this.handleImageSelect.bind(this);
		this.setBlob = this.setBlob.bind(this);
		this.onUploadFinish = this.onUploadFinish.bind(this);
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
		const imgBounding = this.imgElem.getBoundingClientRect();
		const delta = this.state.isResizing === 'left'
			? imgBounding.left - evt.clientX
			: evt.clientX - imgBounding.right;
		const maxWidth = this.rootElem.clientWidth;
		const currentWidth = imgBounding.width;
		const nextSize = Math.min(
			Math.max(
				Math.round(((currentWidth + delta) / maxWidth) * 100),
				20
			),
			100
		);
		this.props.updateAttrs({ size: nextSize });
	}
	updateCaption(evt) {
		this.props.updateAttrs({ caption: evt.target.value });
	}
	updateAlign(val) {
		this.props.updateAttrs({ align: val });
	}
	handleImageSelect(evt) {
		if (evt.target.files.length) {
			this.props.onFileUpload(evt.target.files[0], ()=>{}, this.onUploadFinish, 0);
			this.setState({
				uploading: true,
			});
			this.setBlob(evt.target.files[0]);
		}
	}
	setBlob(image) {
		const reader = new FileReader();
		reader.onload = (imageBlob)=> {
			this.setState({ imageBlob: imageBlob.target.result });
		};
		reader.readAsDataURL(image);
	}
	onUploadFinish(evt, index, type, filename) {
		this.setState({ uploading: false });
		this.props.updateAttrs({ url: `https://assets.pubpub.org/${filename}` });
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

		const imageUrl = this.props.url && this.props.handleResizeUrl ? this.props.handleResizeUrl(this.props.url) : this.props.url;
		return (
			<div className={'figure-wrapper'} ref={(rootElem)=> { this.rootElem = rootElem; }}>
				<figure className={`image ${this.props.isSelected ? 'isSelected' : ''}`} style={figStyle}>
					{this.props.isSelected && this.props.url && this.props.align !== 'full' &&
						<div>
							<div className={'drag-handle left'} onMouseDown={this.onDragMouseDown} role={'button'} tabIndex={-1} />
							<div className={'drag-handle right'} onMouseDown={this.onDragMouseDown} role={'button'} tabIndex={-1} />
						</div>
					}
					{this.props.url &&
						<img
							ref={(imgElem)=> { this.imgElem = imgElem; }}
							src={this.state.imageBlob || imageUrl}
							alt={this.props.caption}
							style={{ opacity: this.state.uploading ? 0 : 1 }}
							onError={(evt)=> {
								/* If the resizer fails, try using the original url */
								if (evt.target.src !== this.props.url) {
									evt.target.src = this.props.url;
								}
							}}
						/>
					}
					{!this.props.url &&
						<label htmlFor={`new-${this.randKey}`} className={'empty-image pt-elevation-0'}>
							<AnchorButton
								className={'pt-button pt-large pt-icon-media pt-minimal'}
								text={'Click to Upload image'}
								loading={this.state.uploading}
							/>
							<input
								id={`new-${this.randKey}`}
								name={'image'}
								type="file"
								className={'file-input'}
								accept="image/png, image/jpeg, image/gif"
								onChange={this.handleImageSelect}
							/>
						</label>
					}
					{!this.props.isSelected &&
						<figcaption>
							{this.props.caption}
						</figcaption>
					}
					{this.props.isSelected && this.props.url &&
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
								<div className={'right-wrapper'}>
									<label htmlFor={this.randKey} className={'file-select'}>
										<AnchorButton
											className={'pt-button'}
											text={'Choose new image'}
											loading={this.state.uploading}
										/>
										<input
											id={this.randKey}
											name={'image'}
											type="file"
											accept="image/png, image/jpeg, image/gif"
											onChange={this.handleImageSelect}
											className={'file-input'}
										/>
									</label>
								</div>
							</div>
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

ImageEditable.propTypes = propTypes;
ImageEditable.defaultProps = defaultProps;
export default ImageEditable;
