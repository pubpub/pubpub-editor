import React from 'react';
import PropTypes from 'prop-types';

require('./video.scss');

const propTypes = {
	caption: PropTypes.string,
	url: PropTypes.string,
	align: PropTypes.oneOf(['full', 'left', 'right', 'center']),
	size: PropTypes.number, // Number as percentage width
};

const defaultProps = {
	caption: '',
	url: '',
	align: 'center',
	size: 50,
};

const VideoStatic = function(props) {
	const figFloat = props.align === 'left' || props.align === 'right' ? props.align : 'none';
	const figMargin = props.align === 'left' || props.align === 'right' ? '10px' : '0em auto 1em';
	const figWidth = props.align === 'full' ? '100%' : `${props.size}%`;
	const figStyle = {
		width: figWidth,
		margin: figMargin,
		float: figFloat,
	};

	if (!props.url) { return null; }

	return (
		<div className={'figure-wrapper'}>
			<figure className={'video'} style={figStyle}>
				<video
					controls
					src={props.url}
					preload="metadata"
				/>
				<figcaption>
					{props.caption}
				</figcaption>
			</figure>
		</div>
	);
};

VideoStatic.propTypes = propTypes;
VideoStatic.defaultProps = defaultProps;
export default VideoStatic;
