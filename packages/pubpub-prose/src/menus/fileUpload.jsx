import { NonIdealState, Spinner, Tab, TabList, TabPanel, Tabs } from '@blueprintjs/core';
import React, { PropTypes } from 'react';

import Dropzone from 'react-dropzone';
import Radium from 'radium';
import { URLToType } from '@pubpub/render-files';
import {s3Upload} from './uploadFile';

// import {globalStyles} from 'utils/styleConstants';


let styles;

export const FileUploadDialog = React.createClass({
	propTypes: {
	},

	getInitialState() {
		return {
			uploadRates: [],
			uploadFiles: [],
			selectedTabIndex: 0
		};
	},

	// On file drop (or on file select)
	// Upload files automatically to s3
	// On completion call function that hits the pubpub server to generate asset information
	// Generated asset information is then sent to Firebase for syncing with other users
	onDrop: function(files) {

		const startingFileIndex = this.state.uploadRates.length;
		const newUploadRates = files.map((file)=> {
			return 0;
		});
		const newUploadFiles = files.map((file)=> {
			return file.name;
		});
		const uploadRates = this.state.uploadRates.concat(newUploadRates);
		const uploadFiles = this.state.uploadFiles.concat(newUploadFiles);


		files.map((file, index)=> {
			s3Upload(file, this.onFileProgress, this.onFileFinish, startingFileIndex + index);
		});

		this.setState({
			uploadRates: uploadRates,
			uploadFiles: uploadFiles,
		});

	},

	// Update state's progress value when new events received.
	onFileProgress: function(evt, index) {
		const percentage = evt.loaded / evt.total;
		const tempUploadRates = this.state.uploadRates;
		tempUploadRates[index] = percentage;
		this.setState({uploadRates: tempUploadRates});
	},

	onFileFinish: function(evt, index, type, filename, title) {

		const fileURL = 'https://assets.pubpub.org/' + filename;
		const realFileName = filename.split('/').pop();
		this.props.uploadFile({url: fileURL, filename: title, preview: true});
	},


	setFilter: function(string) {
		this.setState({filter: string});
	},

	changedTab (selectedTabIndex, prevSelectedTabIndex) {
		this.setState({ selectedTabIndex: selectedTabIndex });
	},

	selectFile(filename, url) {
		this.setState({ selectedURL: url });
		this.props.uploadFile({url, filename, preview: false});
	},

	renderExistingFiles(files) {
		return Object.keys(files).map((filename) => {
				const fileurl = files[filename];
				if (!fileurl) {
					return null;
				}
				const type = URLToType(fileurl);
				if (!type || type.indexOf('image') === -1) {
					return null;
				}
				const selected = (this.state.selectedURL === fileurl);
				return (<div key={filename} onClick={this.selectFile.bind(this, filename, fileurl)} style={styles.card({selected})} className="pt-card pt-elevation-0 pt-interactive">
			     <h5 style={styles.label}><a href="#">{filename}</a></h5>
			     <img src={'https://jake.pubpub.org/unsafe/50x50/' + fileurl}  />
			   </div>);
		});
	},

	preventClick: function(evt) {
		evt.preventDefault();
	},


	render: function() {

		const uploading = (this.state.uploadRates.length > 0);
		const uploadRate = (uploading) ? this.state.uploadRates[0] : 0;

		return (
			<div onClick={this.preventClick}>
				<Tabs onChange={this.changedTab} selectedTabIndex={this.state.selectedTabIndex}>
						<TabList>
								<Tab key="manual">Upload</Tab>
								<Tab key="bibtex">Import from Existing</Tab>
						</TabList>
						<TabPanel>
							<Dropzone ref="dropzone" disableClick={false} onDrop={this.onDrop} style={{}} activeClassName={'dropzone-active'} >
								{(!uploading) ?
									<NonIdealState
										title={'Upload a File'}
										description={'Click or Drag files to add'}
										visual={'folder-open'}
										action={ null}
										/>
									:
									<Spinner
										value={uploadRate}
										/>
								}
							</Dropzone>
						</TabPanel>

						<TabPanel>
							<div style={styles.cardContainer}>
							{this.renderExistingFiles(this.props.files)}
							</div>
						</TabPanel>
				</Tabs>
			</div>
		);
	}

});

export default FileUploadDialog;

styles = {
	label: {
		overflow: 'hidden',
		textOverflow: 'ellipsis',
	},
	cardContainer: {
		backgroundColor: 'white',
		height: '40vh',
		overflowY: 'scroll',
	},
	card: function({selected}) {
		return {
			width: '45%',
			display: 'inline-block',
			margin: '5px',
			backgroundColor: (selected) ? 'rgb(249, 248, 248)' : 'white',
		};
	}
};
