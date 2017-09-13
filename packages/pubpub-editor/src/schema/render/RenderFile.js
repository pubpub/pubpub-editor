import React, { PropTypes } from 'react';

let styles;

export const RenderFile = React.createClass({
	propTypes: {
		file: PropTypes.object,
		style: PropTypes.object,
		draggable: PropTypes.any,
	},

	render() {
		const { draggable, style } = this.props;
 		const file = this.props.file || {};

		switch (file.type) {
		case 'image/png':
		case 'image/jpg': // Is this ever actually used?
		case 'image/jpeg':
		case 'image/gif':
			return <img draggable={draggable} alt={file.name} src={file.url} style={{ maxWidth: '100%', ...style }} />;
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
					<p>Can not render {file.name}. Click to download the file in your browser.</p>
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
