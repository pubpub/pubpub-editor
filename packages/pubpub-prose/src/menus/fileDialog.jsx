import { Button, Dialog } from '@blueprintjs/core';
import React, {PropTypes} from 'react';

import FileUploadDialog from './fileUpload';
import { RenderFile } from '@pubpub/render-files';

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

	uploadFile: function({url, filename, preview, type}) {
		this.setState({url, filename, preview, type});
	},

	saveFile: function() {
		const { url, filename, type } = this.state;
		this.props.saveFile({url, filename, type});
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

	insertFile: function({url, filename}) {
		this.props.insertFile({url, filename});
	},

  renderDisplay() {

    const { open, fileAccept, files, type } = this.props;
		const { url, filename } = this.state;

		let title;
		if (type === 'video') {
			title = "Insert Video"
		} else if (type === 'image') {
			title = "Insert Image"
		} else {
			title = "Insert File"
		}

    return (
      <div onClick={this.preventClick}>
        <Dialog
            iconName="inbox"
            isOpen={open}
            onClose={this.onClose}
            title={title}
        >
            <div className="pt-dialog-body">
								{(!this.state.url || !this.state.preview) ?
									<FileUploadDialog files={files} fileAccept={fileAccept} uploadFile={this.uploadFile} insertFile={this.insertFile}/>
									:
									<div style={{display: 'block', margin: '0 auto', textAlign: 'center', maxWidth: '300px'}}>
											<RenderFile file={{url: this.state.url, type: this.state.type}} />
											<label className="pt-label">
											  <input value={filename} onChange={this.editFileName} className="pt-input" type="text" placeholder="Text input" dir="auto" />
											</label>
									</div>
								 }
            </div>
            <div className="pt-dialog-footer">
							{(type === 'video') ?
								<div className="pt-callout" style={{marginBottom: 10}}>
									Video files can be large! Be ready for a longer upload process. If possible, try and compress and shorten your video.
								</div>
							: null}
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
