/* eslint-disable react/no-danger */
import React from 'react';
import PropTypes from 'prop-types';

require('./latex.scss');

const propTypes = {
	attrs: PropTypes.object.isRequired,
	// options: PropTypes.object.isRequired,
	isSelected: PropTypes.bool.isRequired,
	// isEditable: PropTypes.bool.isRequired,
};

const Image = (props)=> {
	const attrs = props.attrs;
	return (
		<div className={`latex-wrapper ${attrs.isBlock ? 'block' : ''}`}>
			<div className={`render-wrapper ${props.isSelected ? 'isSelected' : ''}`}>
				<span
					dangerouslySetInnerHTML={{ __html: attrs.html }}
				/>
			</div>
		</div>
	);
};

Image.propTypes = propTypes;
export default Image;
