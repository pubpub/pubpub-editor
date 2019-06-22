/* eslint-disable react/no-danger */
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

require('./image.scss');

const propTypes = {
	attrs: PropTypes.object.isRequired,
	options: PropTypes.object.isRequired,
	isSelected: PropTypes.bool.isRequired,
	isEditable: PropTypes.bool.isRequired,
};

const Image = (props) => {
	const attrs = props.attrs;
	const options = props.options;
	const imageUrl =
		attrs.url && props.options.onResizeUrl ? props.options.onResizeUrl(attrs.url) : attrs.url;
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
	const imgElement = (
		<img
			src={imageUrl}
			alt={attrs.caption}
			onError={(evt) => {
				/* If the resizer fails, try using the original url */
				if (evt.target.src !== attrs.url) {
					/* eslint-disable-next-line no-param-reassign */
					evt.target.src = attrs.url;
				}
			}}
		/>
	);
	const useLink = !props.isEditable && options.linkToSrc;
	return (
		<div className={classNames('figure-wrapper', breakout && 'breakout')}>
			<figure
				className={classNames('image', props.isSelected && 'isSelected')}
				style={figStyle}
			>
				{useLink && (
					<a href={attrs.url} target="_blank" rel="noopener noreferrer">
						{imgElement}
					</a>
				)}
				{!useLink && imgElement}
				{attrs.caption && (
					<figcaption dangerouslySetInnerHTML={{ __html: attrs.caption }} />
				)}
			</figure>
		</div>
	);
};

Image.propTypes = propTypes;
export default Image;
