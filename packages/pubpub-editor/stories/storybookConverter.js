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
			options: { template: 'mit' }
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
