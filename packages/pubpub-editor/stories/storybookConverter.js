import React, { PropTypes } from 'react';
import request from 'superagent';
import FullEditor from '../src/editorComponents/FullEditor';
import { markdownToJSON, jsonToMarkdown } from '../src/markdown';
import { localReferences } from './sampledocs/autocompleteLocalData';


export const StoryBookConverter = React.createClass({
	propTypes: {
		initialContent: PropTypes.string,
		mode: PropTypes.string,
	},
	getInitialState() {
		return {
			mode: (this.props.mode) ? this.props.mode : 'markdown',
			content: (this.props.initialContent) ? this.props.initialContent : undefined,
			conversionError: undefined,
			conversionLoading: undefined,
			downloadReadyUrl: undefined
		};
	},
	setMarkdown: function() {
		// const newMarkdown = this.state.content ? jsonToMarkdown(this.state.content) : '';
		const newMarkdown = this.state.content;
		this.setState({
			mode: 'markdown',
			initialContent: newMarkdown,
			content: newMarkdown,
		});
	},
	setConvert: function() {
		console.log(this.state.content)
		// const newMarkdown = this.state.content ? jsonToMarkdown(this.state.content) : '';
		const newMarkdown = this.state.content;

		this.setState({
			mode: 'convert',
			initialContent: newMarkdown,
			content: newMarkdown,
			conversionError: undefined,
			conversionLoading: undefined,
			downloadReadyUrl: undefined
		});
		this.convert();
	},
	onChange: function(newContent) {
		this.setState({ content: newContent });
	},
	convert: function(json) {
		const convertUrl = 'https://pubpub-converter-dev.herokuapp.com';
		const outputType = 'pdf';
		const inputContent = markdownToJSON(this.state.content || '', localReferences);
		const metadata = {};
		console.log(`made ${JSON.stringify(inputContent)} \n\n which was \n\n${this.state.content}`)

		request
		.post(convertUrl)
		.send({
			inputType: 'ppub',
			outputType: outputType,
			// inputUrl: file.url,
			inputContent: inputContent,
			metadata: metadata,
			// options: { template: selectedTemplate }
		})
		.set('Accept', 'application/json')
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
						conversionLoading: false,
						downloadReadyUrl: res.body.url
					});
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
	render: function() {
		const conversionLoading = this.state.conversionLoading;
		const conversionError = this.state.conversionError;
		const downloadReadyUrl = this.state.downloadReadyUrl;

		return (
			<div className={'pt-card pt-elevation-3'} style={{ padding: '0em', margin: '0em auto 2em', maxWidth: '850px' }}>
				<div style={{ backgroundColor: '#ebf1f5', padding: '0.5em', textAlign: 'right', borderBottom: '1px solid rgba(16, 22, 26, 0.15)' }}>
					<div className={'pt-button-group'}>
						<div className={`pt-button${this.state.mode === 'markdown' ? ' pt-active' : ''}`} onClick={this.setMarkdown}>Edit</div>
						<div className={`pt-button${this.state.mode === 'convert' ? ' pt-active' : ''}`} onClick={this.setConvert}>Convert to PDF</div>
					</div>
				</div>
				{ this.state.mode === 'markdown' &&
					<FullEditor onChange={this.onChange} mode={'markdown'}/>
				}

				{ this.state.mode === 'convert' &&
					<div>
						{conversionLoading &&
							<div>
								Conversion currently taking place
							</div>
						}
						{conversionError ? conversionError + '' : ''}
						{!conversionError && downloadReadyUrl &&
							<a href={downloadReadyUrl} target="_blank">Download</a>

						}

					</div>
				}

			</div>
		);
	}
});

export default StoryBookConverter;
