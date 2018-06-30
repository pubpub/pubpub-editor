import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Portal } from 'react-portal';
import { AnchorButton, Slider } from '@blueprintjs/core';
import SimpleEditor from '../../SimpleEditor';

require('./image.scss');

const propTypes = {
	// node: PropTypes.object,
	view: PropTypes.object,
	caption: PropTypes.string.isRequired,
	url: PropTypes.string,
	align: PropTypes.oneOf(['full', 'left', 'right', 'center']).isRequired,
	size: PropTypes.number.isRequired, // Number as percentage width
	isSelected: PropTypes.bool,
	onFileUpload: PropTypes.func.isRequired,
	updateAttrs: PropTypes.func.isRequired,
	handleResizeUrl: PropTypes.func,
	onOptionsRender: PropTypes.func.isRequired,
	optionsContainerRef: PropTypes.object.isRequired,
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
		this.updateCaption = this.updateCaption.bind(this);
		this.updateAlign = this.updateAlign.bind(this);
		this.handleImageSelect = this.handleImageSelect.bind(this);
		this.setBlob = this.setBlob.bind(this);
		this.onUploadFinish = this.onUploadFinish.bind(this);
		this.portalRefFunc = this.portalRefFunc.bind(this);
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
		
		const imageUrl = this.props.url && this.props.handleResizeUrl
			? this.props.handleResizeUrl(this.props.url)
			: this.props.url;
		const figFloat = this.props.align === 'left' || this.props.align === 'right'
			? this.props.align
			: 'none';
		let figMargin = '0em auto 1em';
		if (this.props.align === 'left') { figMargin = '1em 1em 1em 0px'; }
		if (this.props.align === 'right') { figMargin = '1em 0px 1em 1em'; }
		const figWidth = this.props.align === 'full'
			? '100%'
			: `${this.props.size}%`;
		const figStyle = {
			width: figWidth,
			margin: figMargin,
			float: figFloat,
		};

		return (
			<div className="figure-wrapper">
				<figure className={`image ${this.props.isSelected ? 'isSelected' : ''}`} style={figStyle}>
					{this.props.url &&
						<img
							src={this.state.imageBlob || imageUrl}
							alt={this.props.caption}
							style={{ opacity: this.state.uploading ? 0 : 1 }}
						/>
					}
					{!this.props.url &&
						<label htmlFor={`new-${this.randKey}`} className="empty-image pt-elevation-0">
							<AnchorButton
								className="pt-button pt-large pt-icon-media pt-minimal"
								text="Click to Upload image"
								loading={this.state.uploading}
							/>
							<input
								id={`new-${this.randKey}`}
								name="image"
								type="file"
								className="file-input"
								accept="image/png, image/jpeg, image/gif"
								onChange={this.handleImageSelect}
							/>
						</label>
					}
					<figcaption dangerouslySetInnerHTML={{ __html: this.props.caption }} />
				</figure>

				{this.props.isSelected && this.props.url &&
					<Portal 
						ref={this.portalRefFunc} 
						node={this.props.optionsContainerRef.current}
					>
						<div className="options-box">
							<div className="options-title">Image Details</div>
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
								// labelRenderer={(val)=> { return `${val}%`; }}
								// labelStepSize={100}
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
							<div className="source-url">
								<a href={this.props.url}  target="_blank" rel="noopener noreferrer">
									{this.props.url}
								</a>
							</div>

							{/* Select New  File */}
							<label htmlFor={this.randKey} className="file-select">
								<AnchorButton
									className="pt-button"
									text="Choose new image"
									loading={this.state.uploading}
								/>
								<input
									id={this.randKey}
									name="image"
									type="file"
									accept="image/png, image/jpeg, image/gif"
									onChange={this.handleImageSelect}
									className="file-input"
								/>
							</label>
						</div>
					</Portal>
				}
			</div>
		);
	}
}

ImageEditable.propTypes = propTypes;
ImageEditable.defaultProps = defaultProps;
export default ImageEditable;
