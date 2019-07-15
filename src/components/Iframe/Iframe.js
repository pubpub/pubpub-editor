/* eslint-disable react/no-danger */
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

require('./iframe.scss');

const propTypes = {
	attrs: PropTypes.object.isRequired,
	// options: PropTypes.object.isRequired,
	isSelected: PropTypes.bool.isRequired,
	isEditable: PropTypes.bool.isRequired,
};

const Iframe = (props) => {
	const attrs = props.attrs;
	const figFloat = attrs.align === 'left' || attrs.align === 'right' ? attrs.align : 'none';
	const breakout = attrs.align === 'breakout';
	let figMargin = '0em auto 1em';
	if (attrs.align === 'left') {
		figMargin = '1em 1em 1em 0px';
	}
	if (attrs.align === 'right') {
		figMargin = '1em 0px 1em 1em';
	}
	const figWidth = attrs.align === 'full' ? '100%' : `${attrs.size}%`;
	const figStyle = {
		width: figWidth,
		margin: figMargin,
		float: figFloat,
	};

	return (
		<div className={classNames('figure-wrapper', breakout && 'breakout')}>
			<figure
				className={classNames(
					'iframe',
					props.isSelected && 'isSelected',
					props.isEditable && 'isEditable',
				)}
				style={figStyle}
			>
				{attrs.url && (
					<iframe
						title={`iFrame of ${attrs.url}`}
						src={attrs.url}
						height={`${attrs.height}px`}
						allowFullScreen
						frameBorder="0"
					/>
				)}
				{!attrs.url && <div className="empty-iframe">Enter Source URL</div>}
				{attrs.caption && (
					<figcaption dangerouslySetInnerHTML={{ __html: attrs.caption }} />
				)}
			</figure>
		</div>
	);
};

Iframe.propTypes = propTypes;
export default Iframe;
