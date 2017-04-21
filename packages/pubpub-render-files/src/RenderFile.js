import React, { PropTypes } from 'react';

import Radium from 'radium';
import RenderFileDoc from './RenderFileDoc';
import RenderFileMarkdown from './RenderFileMarkdown';
import RenderFilePPT from './RenderFilePPT';

let styles;

export const RenderFile = React.createClass({
	propTypes: {
		file: PropTypes.object,
		allFiles: PropTypes.array,
		style: PropTypes.object,
		draggable: PropTypes.any,
	},

	render() {
		const {draggable, style} = this.props;
 		const file = this.props.file || {};
		console.log('RENDEIRNG', file);

		switch (file.type) {
		case 'text/markdown':
			return (
				<div id={'content-wrapper'} className={'pub-body'} style={styles.pubBody}>
					<RenderFileMarkdown file={file} allFiles={this.props.allFiles} />
				</div>
			);
		case 'image/png':
		case 'image/jpg': // Is this ever actually used?
		case 'image/jpeg':
		case 'image/gif':
			return <img draggable={draggable} alt={file.name} src={file.url} style={{ maxWidth: '100%', ...style }} />;
		case 'application/pdf':
			return (
				<div id={'content-wrapper'}>
					<RenderFilePDF file={file} />
				</div>
			);
		case 'application/vnd.ms-powerpoint':
		case 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
			return <RenderFilePPT file={file} />;
		case 'application/msword':
		case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
			return <RenderFileDoc file={file} />;
		case 'video/mp4':
		case 'mp4':
			return (
				<video width={'100%'} controls>
					<source src={file.url} type={'video/mp4'} />
				</video>
			);
		default:
			return (
				<div className={'pt-callout'}>
					<p>Can not render this file. Click to download the file in your browser.</p>
					<a href={file.url}><button className={'pt-button'}>Click to Download</button></a>
				</div>
			);
		}
	}

});

export default RenderFile;

styles = {
	container: {
		position: 'relative',
	},
	pubBody: {
		padding: '0em 1.25em',
		fontFamily: 'serif',
		lineHeight: '1.6em',
		fontSize: '1.2em',
		color: '#333',
		maxWidth: '700px',
	},
};
