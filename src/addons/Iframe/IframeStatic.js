import React from 'react';
import PropTypes from 'prop-types';

require('./iframeAddon.scss');

const propTypes = {
	caption: PropTypes.string,
	url: PropTypes.string,
	align: PropTypes.oneOf(['full', 'left', 'right', 'center']),
	size: PropTypes.number, // Number as percentage width
	height: PropTypes.number, // Number as pixel height
};

const defaultProps = {
	caption: '',
	url: '',
	align: 'center',
	size: 50,
	height: 419
};

const IframeStatic = function(props) {
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
		<div className={'iframe-figure-wrapper'}>
			<figure className={'iframe'} style={figStyle}>
				<iframe
					title={`iFrame of ${props.url}`}
					src={props.url}
					height={`${this.props.height}px`}
					allowFullScreen
					frameBorder={'0'}
				/>
				<figcaption>
					{props.caption}
				</figcaption>
			</figure>
		</div>
	);
};

IframeStatic.propTypes = propTypes;
IframeStatic.defaultProps = defaultProps;
export default IframeStatic;
