import React from 'react';
import PropTypes from 'prop-types';

require('./image.scss');

const propTypes = {
	caption: PropTypes.string,
	url: PropTypes.string,
	align: PropTypes.oneOf(['full', 'left', 'right', 'center']),
	size: PropTypes.number, // Number as percentage width
	handleResizeUrl: PropTypes.func,
	linkToSrc: PropTypes.bool,
};

const defaultProps = {
	caption: '',
	url: '',
	align: 'center',
	size: 50,
	handleResizeUrl: undefined,
	linkToSrc: false,
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

	if (!props.url) { return null; }
	const imageUrl = props.handleResizeUrl ? props.handleResizeUrl(props.url) : props.url;
	const imgElement = <img src={imageUrl} alt={props.caption} />;
	return (
		<div className="figure-wrapper">
			<figure className="image" style={figStyle}>
				{props.linkToSrc &&
					<a href={props.url} target="_blank" rel="noopener noreferrer">
						{imgElement}
					</a>
				}
				{!props.linkToSrc &&
					imgElement
				}
				{props.caption &&
					<figcaption dangerouslySetInnerHTML={{ __html: props.caption }} />
				}
			</figure>
		</div>
	);
};

ImageStatic.propTypes = propTypes;
ImageStatic.defaultProps = defaultProps;
export default ImageStatic;
