/* eslint-disable react/no-danger */
import React from 'react';
import PropTypes from 'prop-types';

require('./citation.scss');

const propTypes = {
	attrs: PropTypes.object.isRequired,
	// options: PropTypes.object.isRequired,
	isSelected: PropTypes.bool.isRequired,
	// isEditable: PropTypes.bool.isRequired,
};

const Citation = (props) => {
	const attrs = props.attrs;

	return (
		<div className="citation-wrapper">
			<span className={`count-wrapper ${props.isSelected ? 'isSelected' : ''}`}>
				<span className="citation">[{attrs.count}]</span>
			</span>

			<div className="render-wrapper">
				{attrs.value && <div dangerouslySetInnerHTML={{ __html: attrs.html }} />}
				{attrs.unstructuredValue && (
					<div dangerouslySetInnerHTML={{ __html: attrs.unstructuredValue }} />
				)}
				{!attrs.value && !attrs.unstructuredValue && (
					<div className="empty-text">No Citation text entered...</div>
				)}
			</div>
		</div>
	);
};

Citation.propTypes = propTypes;
export default Citation;
