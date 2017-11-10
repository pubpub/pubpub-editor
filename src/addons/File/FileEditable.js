import React, { Component } from 'react';
import PropTypes from 'prop-types';
import filesize from 'filesize';
import { AnchorButton } from '@blueprintjs/core';

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

	render() {
		const extension = this.props.fileName ? this.props.fileName.split('.').pop() : '';
		return (
			<div className={'file-figure-wrapper editable'} ref={(rootElem)=> { this.rootElem = rootElem; }}>
				<div className={`file ${this.props.isSelected ? 'isSelected' : ''}`}>
					{this.props.url &&
						<div className={'pt-card pt-elevation-2 details'}>
							<div className={'file-icon file-icon-default'} data-type={extension.substring(0, 4)} />
							<div className={'file-name'}>
								<a href={this.props.url} target={'_blank'}>{this.props.fileName}</a>
							</div>
							<div className={'file-size'} contentEditable={false}>{this.props.fileSize}</div>
							<a className={'pt-button pt-icon-download'} href={this.props.url} target={'_blank'} />
						</div>
					}
					{!this.props.url &&
						<label htmlFor={`new-${this.randKey}`} className={'empty-image pt-elevation-0'}>
							<AnchorButton
								className={'pt-button pt-large pt-icon-document pt-minimal'}
								text={'Click to Upload file'}
								loading={this.state.uploading}
							/>
							<input
								id={`new-${this.randKey}`}
								name={'file'}
								type="file"
								className={'file-input'}
								accept="*"
								onChange={this.handleFileSelect}
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
								<div className={'right-wrapper'}>
									<label htmlFor={this.randKey} className={'file-select'}>
										<AnchorButton
											className={'pt-button'}
											text={'Choose new file'}
											loading={this.state.uploading}
										/>
										<input
											id={this.randKey}
											name={'file'}
											type="file"
											accept="*"
											onChange={this.handleFileSelect}
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
				</div>
			</div>
		);
	}
}

FileEditable.propTypes = propTypes;
FileEditable.defaultProps = defaultProps;
export default FileEditable;
