import React, { PropTypes } from 'react';
import request from 'superagent';
import FullEditor from '../src/editorComponents/FullEditor';
import { markdownToJSON, jsonToMarkdown } from '../src/markdown';
import { localReferences } from './sampledocs/autocompleteLocalData';


export const StoryBookImportConverter = React.createClass({
	getInitialState() {
		return {
			mode: (this.props.mode) ? this.props.mode : 'upload',
			content: undefined,
			convertableFiles: [], // It is capable of doing many files, but we just do one for the sake of simplicity
			inputTypes: [],
			conversionLoading: undefined,
			conversionError: undefined,
			downloadReadyUrl: undefined
		};
	},
	componentDidMount() {
		const inputTypesUrl = 'https://pubpub-converter-dev.herokuapp.com/inputTypes';

		console.log(`sending request friend`)
		request
		.get(inputTypesUrl)
		.send()
		.set('Accept', 'application/json')
		.end((err, res) => {
			if (err || !res.ok) {
				console.log('Oh no! error', err);
			} else {
				console.log(`input types is now ${JSON.stringify(res.body)}`)
				this.setState({
					inputTypes: res.body
				});
			}
		});
	},
	setUpload: function()  {
		// const newMarkdown = this.state.content ? jsonToMarkdown(this.state.content) : '';
		this.setState({
			mode: 'upload',
			// content: newMarkdown,
			convertableFiles: [],
			conversionLoading: undefined,
			conversionError: undefined,
			downloadReadyUrl: undefined,
			content: undefined,

		});
	},

	setConvert: function() {
		// const newMarkdown = this.state.content ? jsonToMarkdown(this.state.content) : '';
		this.setState({
			mode: 'convert',
			// content: newMarkdown,
		});
		this.convert()
	},

	handleFileUploads: function(evt) {
		const files = [];
		for (let index = 0; index < evt.target.files.length; index++) {
			files.push(evt.target.files[index]);
		}
		let convertableFiles = this.state.convertableFiles;
		const inputTypes = this.state.inputTypes;

		files.map((file) => {

			const extension = file.name.split('.').pop();
			// Use the API to populate this field
			if (inputTypes.indexOf(extension) !== -1) {
				console.log(`pushing a file ${file}`)
				convertableFiles.push(file);
			}
		});
		console.log(`convertablefiles is ${convertableFiles}`)

		this.setState({
			convertableFiles: convertableFiles,
		});
	},

	pollURL: function(url) {
		const pollUrl = 'https://pubpub-converter-dev.herokuapp.com' + url;

		request
		.get(pollUrl)
		.end((err, res) => {
			console.log(err, res);

			if (!err && res && res.statusCode === 200) {

				if (res.body.url) {

					this.setState({
						downloadReadyUrl: res.body.url
					});
					this.fetchContent();
				} else {
					window.setTimeout(this.pollURL.bind(this, url), 2000);
				}
			} else if (err) {
				console.log(`error is ${err}, res is ${JSON.stringify(res)}`)
				this.setState({
					conversionError: `${err}, ${res.text}`,
					conversionLoading: false

				});

			}
		});
	},
	fetchContent: function() {
		const downloadReadyUrl = this.state.downloadReadyUrl;
		request
		.get(downloadReadyUrl)
		.end((err, res) => {
			if (err || !res.ok) {
				console.log('Oh no! error', err);
			} else {
				console.log(`res: ${JSON.stringify(res)}`, res.text, res.test)
				this.setState({
					conversionLoading: false,
					content: res.text
				});
			}
		});
	},

	convert: function() {
		const convertUrl = 'https://pubpub-converter-dev.herokuapp.com';
		const outputType = 'md';
		const inputFile = this.state.convertableFiles.pop(); // just take the last lol for now
		const metadata = {};
		const reader = new FileReader();
		console.log(inputFile.name, inputFile.content)

		reader.onloadend = (evt) => {
			console.log('Passing this: ' + evt.target.result);
			// const array = new Int8Array(evt.target.result);

			request
			.post(convertUrl)
			.send({
				inputType: inputFile.name.split('.').pop(),
				outputType: outputType +'',
				// inputUrl: file.url,
				// inputContent: new Blob([evt.target.result], { type: 'application/pdf' }),
				inputContent: evt.target.result,
				metadata: metadata,
				// options: { template: selectedTemplate }
			})
			// .set('Accept', 'application/json')
			// .set('Content-Type', 'application/json')
			.end((err, res) => {
				if (err || !res.ok) {
					alert('Oh no! error', err);
				} else {
					const pollUrl = res.body.pollUrl;
					window.setTimeout(this.pollURL.bind(this, pollUrl), 2000);
					this.setState({
						conversionLoading: true,
					});
				}
			});
		};

		reader.readAsBinaryString(inputFile);

	},

	render: function() {
		const downloadReadyUrl = this.state.downloadReadyUrl;
		const conversionLoading = this.state.conversionLoading;
		return (
			<div className={'pt-card pt-elevation-3'} style={{ padding: '0em', margin: '0em auto 2em', maxWidth: '850px' }}>
				<div style={{ backgroundColor: '#ebf1f5', padding: '0.5em', textAlign: 'right', borderBottom: '1px solid rgba(16, 22, 26, 0.15)' }}>
					<div className={'pt-button-group'}>
					<div className={`pt-button${this.state.mode === 'upload' ? ' pt-active' : ''}`} onClick={this.setUpload}>Upload</div>
					<div className={`pt-button${this.state.mode === 'convert' ? ' pt-active' : ''}`} onClick={this.setConvert}>Import to Markdown</div>
					</div>
				</div>
				{this.state.mode === 'upload' &&
					<div>
						{(this.state.inputTypes.length === 0) &&
							<div>
							input types loading, if this takes too long it may indicate an error at https://pubpub-converter-dev.herokuapp.com/inputTypes.
							</div>
						}
						<label className="pt-button" htmlFor={'add-files'}>
							Upload File
							<input type="file" id={'add-files'} multiple style={{ position: 'fixed', top: '-100px' }} onChange={this.handleFileUploads} />
						</label>
					</div>
				}
				{this.state.mode === 'convert' &&
					<div>
					{ conversionLoading &&
						<div>Conversion currently loading</div>
					}
					{ !conversionLoading &&
						<div>
							<FullEditor initialContent={this.state.content} mode={'markdown'}/>
						</div>
					}
				</div>
				}
			</div>
		);
	}
});

export default StoryBookImportConverter;
