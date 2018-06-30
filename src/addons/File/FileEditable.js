import React, { Component } from 'react';
import PropTypes from 'prop-types';
import filesize from 'filesize';
import { Portal } from 'react-portal';
import { AnchorButton } from '@blueprintjs/core';
import SimpleEditor from '../../SimpleEditor';

require('./file.scss');

const propTypes = {
	// node: PropTypes.object,
	// view: PropTypes.object,
	url: PropTypes.string,
	fileName: PropTypes.string,
	fileSize: PropTypes.string,
	caption: PropTypes.string,
	isSelected: PropTypes.bool,
	onFileUpload: PropTypes.func.isRequired,
	updateAttrs: PropTypes.func.isRequired,
	onOptionsRender: PropTypes.func.isRequired,
	optionsContainerRef: PropTypes.object.isRequired,
};

const defaultProps = {
	node: {},
	url: '',
	fileName: '',
	fileSize: '',
	caption: '',
	isSelected: false,
	view: {},
};

class FileEditable extends Component {
	constructor(props) {
		super(props);
		this.state = {
			uploading: false,
			loadingFileName: '',
			loadingFileSize: '',
		};
		this.randKey = Math.round(Math.random() * 99999);
		this.updateCaption = this.updateCaption.bind(this);
		this.handleFileSelect = this.handleFileSelect.bind(this);
		this.onUploadFinish = this.onUploadFinish.bind(this);
		this.portalRefFunc = this.portalRefFunc.bind(this);
	}

	handleFileSelect(evt) {
		if (evt.target.files.length) {
			const file = evt.target.files[0];
			this.props.onFileUpload(file, ()=>{}, this.onUploadFinish, 0);
			this.setState({
				uploading: true,
				loadingFileName: file.name,
				loadingFileSize: filesize(file.size, { round: 0 }),
			});
		}
	}

	onUploadFinish(evt, index, type, filename) {
		this.setState({ uploading: false });
		this.props.updateAttrs({
			url: `https://assets.pubpub.org/${filename}`,
			fileName: this.state.loadingFileName,
			fileSize: this.state.loadingFileSize,
		});
	}

	updateCaption(evt) {
		this.props.updateAttrs({ caption: evt.target.value });
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
		const extension = this.props.fileName ? this.props.fileName.split('.').pop() : '';
		return (
			<div className="figure-wrapper">
				<figure className={`file ${this.props.isSelected ? 'isSelected' : ''}`}>
					{this.props.url &&
						<div className="pt-card pt-elevation-2 details">
							<div className="file-icon file-icon-default" data-type={extension.substring(0, 4)} />
							<div className="file-name">
								<a href={this.props.url} target="_blank" rel="noopener noreferrer">
									{this.props.fileName}
								</a>
							</div>
							<div className="file-size" contentEditable={false}>{this.props.fileSize}</div>
							<a className="pt-button pt-icon-download" href={this.props.url} target="_blank" rel="noopener noreferrer" />
						</div>
					}
					{!this.props.url &&
						<label htmlFor={`new-${this.randKey}`} className="empty-image pt-elevation-0">
							<AnchorButton
								className="pt-button pt-large pt-icon-document pt-minimal"
								text="Click to Upload file"
								loading={this.state.uploading}
							/>
							<input
								id={`new-${this.randKey}`}
								name="file"
								type="file"
								className="file-input"
								accept="*"
								onChange={this.handleFileSelect}
							/>
						</label>
					}
					{this.props.caption &&
						<figcaption dangerouslySetInnerHTML={{ __html: this.props.caption }} />
					}
				</figure>
				{this.props.isSelected && this.props.url &&
					<Portal 
						ref={this.portalRefFunc} 
						node={this.props.optionsContainerRef.current}
					>
						<div className="options-box">
							<div className="options-title">File Details</div>
							
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
									text="Choose new file"
									loading={this.state.uploading}
								/>
								<input
									id={this.randKey}
									name="file"
									type="file"
									accept="*"
									onChange={this.handleFileSelect}
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

FileEditable.propTypes = propTypes;
FileEditable.defaultProps = defaultProps;
export default FileEditable;
