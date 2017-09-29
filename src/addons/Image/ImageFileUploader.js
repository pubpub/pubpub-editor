import React from 'react';
import PropTypes from 'prop-types';
import { Dialog } from '@blueprintjs/core';

const propTypes = {
	onClose: PropTypes.func.isRequired,
	isOpen: PropTypes.bool.isRequired,
	onFileSelect: PropTypes.func.isRequired,
};

const ImageFileUploader = (props)=>{
	return (
		<Dialog isOpen={props.isOpen} onClose={props.onClose} title={'Upload Files'}>
			<div className="pt-dialog-body">
				<label htmlFor={'upload-media-input'} className="pt-button">
					Choose File to Upload
					<input id={'upload-media-input'} type="file" onChange={props.onFileSelect} style={{ position: 'fixed', top: '-1000px' }} />
				</label>
			</div>
		</Dialog>
	);
};

ImageFileUploader.propTypes = propTypes;
export default ImageFileUploader;
