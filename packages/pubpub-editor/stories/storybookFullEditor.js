import React, { PropTypes } from 'react';
import { jsonToMarkdown, markdownToJSON } from '../src/markdown';
import { localDiscussions, localFiles, localHighlights, localPages, localPubs, localReferences, localUsers } from './sampledocs/autocompleteLocalData';

// import MarkdownEditor from '../src/editorComponents/MarkdownEditor';
// import RichEditor from '../src/editorComponents/RichEditor';
import FullEditor from '../src/editorComponents/FullEditor';
import RenderDocument from '../src/RenderDocument/RenderDocument';

import {csltoBibtex} from '../src/references/csltobibtex';
import { s3Upload } from './utils/uploadFile';
import { Menu, MenuItem, Popover, PopoverInteractionKind, Position } from '@blueprintjs/core';

import request from 'superagent';

// requires style attributes that would normally be up to the wrapping library to require
require('@blueprintjs/core/dist/blueprint.css');
require('./utils/pubBody.scss');

// require('../style/base.scss');
// require('../style/markdown.scss');

export const StoryBookFullEditor = React.createClass({

	propTypes: {
		initialContent: PropTypes.string,
		mode: PropTypes.string,
	},

	getInitialState() {
		return {
			mode: (this.props.mode) ? this.props.mode : 'rich',
			initialContent: (this.props.initialContent) ? this.props.initialContent : undefined,
			content: (this.props.initialContent) ? this.props.initialContent : undefined,
			exportLoading: undefined,
			exportError: undefined,
			exportUrl: undefined,
			pdftexTemplates: {},
		}
	},
	componentWillMount: function() {
		const reqURL = 'https://pubpub-converter-dev.herokuapp.com/templates';

		if (Object.keys(this.state.pdftexTemplates).length === 0 && this.state.pdftexTemplates.constructor === Object) {


			request
			.get(reqURL)
			.end((err, res) => {
				this.setState({
					pdftexTemplates: res.body
				});
			});
		}
	},

	setMarkdown: function() {
		const newMarkdown = this.state.content ? jsonToMarkdown(this.state.content) : '';
		this.setState({
			mode: 'markdown',
			initialContent: newMarkdown,
			content: newMarkdown,
			exportLoading: undefined,
			exportError: undefined,
			exportUrl: undefined

		});
	},

	setRich: function() {
		let newJSON;
		if (this.state.mode === 'markdown') {
			newJSON = markdownToJSON(this.state.content || '', localReferences);
		} else {
			newJSON = this.state.content;
		}
		this.setState({
			mode: 'rich',
			initialContent: newJSON,
			content: newJSON,
			exportLoading: undefined,
			exportError: undefined,
			exportUrl: undefined

		});
	},

	setPreview: function() {
		let json;
		if (this.state.mode === 'markdown') {
			json = markdownToJSON(this.state.content || '', localReferences);
		} else if (this.state.mode === 'rich') {
			json = this.state.content;
		}
		this.setState({
			mode: 'preview',
			content: json,

		});
	},

	setExport: function(template) {
		this.setState({
			mode: 'export',
			exportLoading: true,

		});

		// Do request stuff
		this.convert(template);
	},


	onChange: function(newContent) {
		this.setState({ content: newContent });
	},



	handleFileUpload: function(file, callback) {
		// Do the uploading - then callback
		const onFinish = (evt, index, type, filename, title, url) => {
			callback(title, url);
		};
		s3Upload(file, null, onFinish, 0);
	},

	handleReferenceAdd: function(newCitationObject, callback) {
		const bibtexString = csltoBibtex([newCitationObject]);
		console.log('Adding string!', bibtexString);
		localReferences.push(newCitationObject);
		// Do the adding/creation to the bibtex file - then callback
		if (callback) {
			callback(newCitationObject);
		}
	},
	convert: function(template) {
		const convertUrl = 'https://pubpub-converter-dev.herokuapp.com';
		const outputType = 'pdf';
		const inputContent = markdownToJSON(this.state.content || '', localReferences);
		const metadata = {
			title: 'Encoding Data into Physical Objects with Digitally Fabricated Textures',
			authors: ['Travis Rich'],
			degree: 'Master of Science in Media Arts and Sciences',
			institute: ['Massachussets Institute of Technology'],
			// date: '05/09/1991',
			'supervisor-name': 'Andrew Lippman',
			'supervisor-title': 'Associate Director & Senior Research Scientist, MIT Media Lab',
			'department-chairman-name': 'Professor Patricia Maes',
			'department-chairman-title': 'Associate Academic Head, Program in Media Arts and Sciences',
			acknowledgements: 'Like all good adventures, landing at the end of writing your thesis is filled with as much excitement for the end result as bewilderment at the path it took to get there. As twisting and windy as that path may have been, there are always hoards of people who have kept me from skidding past the sharp turns and sinking too far into the deep dives. To that end, thank you everyone who helped me get from A to B (and Z, H, K, and M in between). The Media Lab is unlike any community I’ve ever been a part of and I’m extremely grateful to have been able to complete this work as part of it. Thank you everyone for the Friday teas, 99 Fridays, ping pong, free appetizers, foodcam rations, and Muddy brainstorms. With the utmost gratitude, I thank my advisor, Andy Lippman, for bringing me to the Lab and providing amazing experiences throughout this two years Master’s. I’m extremely grateful for all the support, advice, and ideas you’ve given me. Thank you to my readers, Pattie Maes and Mike Bove, for helping me funnel the sparks in my head down into something worthwhile and exciting. It’s been wonderful working with you. Thanks to the Viral Spaces group (Matt Blackshaw, Kwan Hong Lee , Julia Ma, Dawei Shen, Shen Shen, Dan Sawada, Jonathan Speiser, Eyal Toledano, Deb Widener, Grace Woo, and Polychronis Ypodimatopoulos) for being in the trenches with me and giving me enough fuel for thought to last decades. Thanks to all the MIT friends who have been there to get food, drinks, and free t-shirts for these past two years. Nothing is sadder than the fact that we don’t get to always play in the same building. In more ways than I can count, I’m indebted to my family — Dad, Mom, Josh, and Peter — for raising me to be eager and interested in exploring the world’s questions. Thank you. To my non-genetic family at 9 Rollins, thanks for keeping me sane and happy. To Grace Lin, thanks for being there every step of the way. I couldn’t be happier that I get to share countless adventures with you. To all my friends inside and outside the Lab, thank you for taking me to where I am today.',
			abstract: 'This thesis presents and outlines a system for encoding physical passive objects with deterministic surface features that contain identifying information about that object. The goal of such work is to take steps towards a self-descriptive universe in which all objects contain within their physical structure hooks to information about how they can be used, how they can be fixed, what they’re used for, who uses them, etc. By exploring modern manufacturing processes, several techniques for creating these deterministic textures are presented. Of high importance is the advancement of 3D printing technologies. By leveraging the rapid prototyping capabilities such machines offer, this thesis looks at how personalized objects and draft models may be encoded with data that allows annotations, ideas, and notes to be associated with physical points across that object. Whereas barcodes, QR codes, and RFID tags are often used to associate a single object with a single piece of data, this technique of encoding surfaces will allow for many points of identification to be placed on a single object, enabling applications in learning, group interaction, and gaming.',
			'degree-month': 'June',
			'degree-year': '2013',
			'thesis-date': 'May 6, 2013',
			department: 'Program in Media Arts and Sciences, School of Architecture and Planning',
			'past-degrees': ['B.S. Boston University (2010)', 'M.S. Boston University (2011)'],
			'pub-readers': [
				{ name: 'Patricia Maes', title: 'Professor of Media Technology', affiliation:  'Program in Media Arts and Sciences' },
				{ name: 'Goerge Sweg', title: 'Professor of Fun', affiliation:  'Media Arts and Sciences' },
				{ name: 'V. Michael Bove, Jr', title: 'Principal Research Scientist', affiliation: 'Media Lab' }
			]
		};

		console.log(`made ${JSON.stringify(inputContent)} \n\n which was \n\n${this.state.content}`)

		request
		.post(convertUrl)
		.send({
			inputType: 'ppub',
			outputType: outputType,
			// inputUrl: file.url,
			inputContent: inputContent,
			metadata: metadata,
			options: { template: template }
		})
		.set('Accept', 'application/json')
		.end((err, res) => {
			if (err || !res.ok) {
				alert('Oh no! error', err);
			} else {
				const pollUrl = res.body.pollUrl;
				window.setTimeout(this.pollURL.bind(this, pollUrl), 2000);
				this.setState({
					exportLoading: true,
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
						exportLoading: false,
						exportUrl: res.body.url
					});
				} else {
					window.setTimeout(this.pollURL.bind(this, url), 2000);
				}
			} else if (err) {
				console.log(`error is ${err}, res is ${JSON.stringify(res)}`)
				this.setState({
					exportError: `${err}, ${res.text}`,
					exportLoading: false

				});

			}
		});
	},

	render: function() {
		const editorProps = {
			initialContent: this.state.initialContent,
			onChange: this.onChange,
			handleFileUpload: this.handleFileUpload,
			handleReferenceAdd: this.handleReferenceAdd,
			localFiles: localFiles,
			localPubs: localPubs,
			localReferences: localReferences,
			localUsers: localUsers,
			localHighlights: localHighlights,
			localDiscussions: localDiscussions,
			localPages: localPages,

			globalCategories: ['pubs', 'users'],
		};
		const pdftexTemplates = this.state.pdftexTemplates;
		console.log(pdftexTemplates)
		const popoverContent = (
			<div>
				<h5>Popover title</h5>
				{ Object.keys(pdftexTemplates).map((key) => {

						return (
							<div>
							<div className={`pt-button pt-popover-dismiss`} onClick={this.setExport.bind(this, key)}>{pdftexTemplates[key].displayName}</div>
							<br/>
						</div>
						);
					})
				}

			</div>
		);
		return (
			<div className={'pt-card pt-elevation-3'} style={{ padding: '0em', margin: '0em auto 2em', maxWidth: '850px' }}>
				<div style={{ backgroundColor: '#ebf1f5', padding: '0.5em', textAlign: 'right', borderBottom: '1px solid rgba(16, 22, 26, 0.15)' }}>
					<div className={'pt-button-group'}>
						<div className={`pt-button${this.state.mode === 'markdown' ? ' pt-active' : ''}`} onClick={this.setMarkdown}>Markdown</div>
						<div className={`pt-button${this.state.mode === 'rich' ? ' pt-active' : ''}`} onClick={this.setRich}>Rich</div>
						<div className={`pt-button${this.state.mode === 'preview' ? ' pt-active' : ''}`} onClick={this.setPreview}>Preview</div>
						<Popover
							content={popoverContent}
							interactionKind={PopoverInteractionKind.CLICK}
							popoverClassName="pt-popover-content-sizing"
							position={Position.BOTTOM_RIGHT}
							>
							<div className={`pt-button${this.state.mode === 'export' ? ' pt-active' : ''}`}>Export </div>
						</Popover>
					</div>
				</div>
				<div style={{ padding: '1em 4em', minHeight: '400px' }}>
				{(this.state.mode === 'preview') &&
					<RenderDocument json={this.state.content} allFiles={localFiles} allReferences={localReferences} />
				}
				{(this.state.mode === 'rich' || this.state.mode === 'markdown') &&
					<FullEditor {...editorProps} mode={this.state.mode} />
				}
				{this.state.mode === 'export' &&
					<div>
						{this.state.exportLoading && !this.state.exportError &&
							<div>
								Loading PDF
							</div>
						}
						{this.state.exportUrl &&
							<div>
								<iframe src={`http://docs.google.com/gview?url=${this.state.exportUrl}&embedded=true`} style={{ width: '100%', height:'700px' }}></iframe>
							</div>
						}
					</div>
				}
				</div>


			</div>

		);
	}
});

export default StoryBookFullEditor;
