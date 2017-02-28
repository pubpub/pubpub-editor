import { Button, Dialog } from '@blueprintjs/core';
import React, {PropTypes} from 'react';

import FilePreview from './filePreview';
import FileUploadDialog from './fileUpload';

let styles = {};

export const FileDialog = React.createClass({
	propTypes: {
    fileAccept: PropTypes.string,
		saveFile: PropTypes.func,
    onClose: PropTypes.func,
		open: PropTypes.bool,
	},
	getInitialState: function() {
    return {editing: true};
	},

	setSelected: function(selected) {
		this.setState({selected});
	},

	uploadFile: function({url, filename, preview}) {
		this.setState({url, filename, preview});
	},

	saveFile: function() {
		const { url, filename } = this.state;
		this.props.saveFile({url, filename});
	},

	onClose: function() {
		this.props.onClose();
	},

	preventClick: function(evt) {
		evt.preventDefault();
	},

	editFileName: function(evt) {
		this.setState({filename: evt.target.value});
	},

  renderDisplay() {

    const { open, fileAccept, files } = this.props;
		const { url, filename } = this.state;

    return (
      <div onClick={this.preventClick}>
        <Dialog
            iconName="inbox"
            isOpen={open}
            onClose={this.onClose}
            title="Insert file"
        >
            <div className="pt-dialog-body">
								{(!this.state.url || !this.state.preview) ?
									<FileUploadDialog files={files} fileAccept={fileAccept} uploadFile={this.uploadFile}/>
									:
									<div style={{display: 'block', margin: '0 auto', textAlign: 'center', maxWidth: '300px'}}>
										<FilePreview fileURL={this.state.url} />
											<label className="pt-label">
											  <input value={filename} onChange={this.editFileName} className="pt-input" type="text" placeholder="Text input" dir="auto" />
											</label>
									</div>
								 }
            </div>
            <div className="pt-dialog-footer">
                <div className="pt-dialog-footer-actions">
                    <Button intent={'yes'} disabled={!(this.state.url)} onClick={this.saveFile} text="Upload" />
                </div>
            </div>
        </Dialog>
      </div>
    );
  },

  render: function() {
    const {editing} = this.state;
		return this.renderDisplay();
	}
});

export default FileDialog;
