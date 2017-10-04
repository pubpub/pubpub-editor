import React from 'react';
import PropTypes from 'prop-types';

require('./imageAddon.scss');

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

const ImageStatic = function(props) {
	const figFloat = props.align === 'left' || props.align === 'right' ? props.align : 'none';
	const figMargin = props.align === 'left' || props.align === 'right' ? '10px' : '0em auto 1em';
	const figWidth = props.align === 'full' ? '100%' : `${props.size}%`;
	const figStyle = {
		width: figWidth,
		margin: figMargin,
		float: figFloat,
	};

	return (
		<div className={'figure-wrapper'}>
			<figure className={'image'} style={figStyle}>
				<img
					src={props.url}
					alt={props.caption}
				/>
				<figcaption>
					{props.caption}
				</figcaption>
			</figure>
		</div>
	);
};

ImageStatic.propTypes = propTypes;
ImageStatic.defaultProps = defaultProps;
export default ImageStatic;
