import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { AnchorButton } from '@blueprintjs/core';

require('./video.scss');

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
};

const defaultProps = {
	node: {},
	url: '',
	isSelected: false,
	view: {},
};

class VideoEditable extends Component {
	constructor(props) {
		super(props);
		this.state = {
			isResizing: false,
			uploading: false,
			localURL: null,
		};
		this.randKey = Math.round(Math.random() * 99999);
		this.onDragMouseDown = this.onDragMouseDown.bind(this);
		this.onDragMouseUp = this.onDragMouseUp.bind(this);
		this.onMouseMove = this.onMouseMove.bind(this);
		this.updateCaption = this.updateCaption.bind(this);
		this.updateAlign = this.updateAlign.bind(this);
		this.handleVideoSelect = this.handleVideoSelect.bind(this);
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
		const videoBounding = this.videoElem.getBoundingClientRect();
		const delta = this.state.isResizing === 'left'
			? videoBounding.left - evt.clientX
			: evt.clientX - videoBounding.right;
		const maxWidth = this.rootElem.clientWidth;
		const currentWidth = videoBounding.width;
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
	handleVideoSelect(evt) {
		if (evt.target.files.length) {
			this.props.onFileUpload(evt.target.files[0], ()=>{}, this.onUploadFinish, 0);
			this.setState({
				uploading: true,
			});
			this.setBlob(evt.target.files[0]);
		}
	}
	setBlob(video) {
		// const reader = new FileReader();
		// reader.onload = (localURL)=> {
			// this.setState({ localURL: localURL.target.result });
		// };
		// reader.readAsDataURL(image);
		this.setState({ localURL: URL.createObjectURL(video) });
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

		return (
			<div className={'figure-wrapper'} ref={(rootElem)=> { this.rootElem = rootElem; }}>
				<figure className={`video ${this.props.isSelected ? 'isSelected' : ''}`} style={figStyle}>
					{this.props.isSelected && this.props.url && this.props.align !== 'full' &&
						<div>
							<div className={'drag-handle left'} onMouseDown={this.onDragMouseDown} role={'button'} tabIndex={-1} />
							<div className={'drag-handle right'} onMouseDown={this.onDragMouseDown} role={'button'} tabIndex={-1} />
						</div>
					}
					{this.props.url &&
						<video
							controls
							ref={(videoElem)=> { this.videoElem = videoElem; }}
							src={this.state.localURL || this.props.url}
							style={{ opacity: this.state.uploading ? 0 : 1 }}
							preload="metadata"
						/>
					}
					{!this.props.url &&
						<label htmlFor={`new-${this.randKey}`} className={'empty-video pt-elevation-0'}>
							<AnchorButton
								className={'pt-large pt-icon-video pt-minimal'}
								text={'Click to Upload video'}
								loading={this.state.uploading}
							/>
							<input
								id={`new-${this.randKey}`}
								name={'video'}
								type="file"
								className={'file-input'}
								accept="video/mp4, video/webm"
								onChange={this.handleVideoSelect}
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
											text={'Choose new video'}
											loading={this.state.uploading}
										/>
										<input
											id={this.randKey}
											name={'video'}
											type="file"
											accept="video/mp4, video/webm"
											onChange={this.handleVideoSelect}
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

VideoEditable.propTypes = propTypes;
VideoEditable.defaultProps = defaultProps;
export default VideoEditable;
