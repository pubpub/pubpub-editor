/* eslint-disable react/no-danger */
import React from 'react';
import PropTypes from 'prop-types';

require('./iframe.scss');

const propTypes = {
	attrs: PropTypes.object.isRequired,
	// options: PropTypes.object.isRequired,
	isSelected: PropTypes.bool.isRequired,
	isEditable: PropTypes.bool.isRequired,
};

const Image = (props)=> {
	const attrs = props.attrs;
	const figFloat = attrs.align === 'left' || attrs.align === 'right'
		? attrs.align
		: 'none';
	let figMargin = '0em auto 1em';
	if (attrs.align === 'left') { figMargin = '1em 1em 1em 0px'; }
	if (attrs.align === 'right') { figMargin = '1em 0px 1em 1em'; }
	const figWidth = attrs.align === 'full'
		? '100%'
		: `${attrs.size}%`;
	const figStyle = {
		width: figWidth,
		margin: figMargin,
		float: figFloat,
	};

	return (
		<div className="figure-wrapper">
			<figure className={`iframe ${props.isSelected ? 'isSelected' : ''} ${props.isEditable ? 'isEditable' : ''}`} style={figStyle}>
				{attrs.url &&
					<iframe
						title={`iFrame of ${attrs.url}`}
						src={attrs.url}
						height={`${attrs.height}px`}
						allowFullScreen
						frameBorder="0"
					/>
				}
				{!attrs.url &&
					<div className="empty-iframe">
						Enter Source URL
					</div>
				}
				{attrs.caption &&
					<figcaption dangerouslySetInnerHTML={{ __html: attrs.caption }} />
				}
			</figure>
		</div>
	);
};

Image.propTypes = propTypes;
export default Image;
