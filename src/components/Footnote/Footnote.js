/* eslint-disable react/no-danger */
import React from 'react';
import PropTypes from 'prop-types';

require('./footnote.scss');

const propTypes = {
	attrs: PropTypes.object.isRequired,
	// options: PropTypes.object.isRequired,
	isSelected: PropTypes.bool.isRequired,
	// isEditable: PropTypes.bool.isRequired,
};

const Footnote = (props) => {
	const attrs = props.attrs;

	return (
		<span className="footnote-wrapper" tabIndex={-1}>
			<span className={`count-wrapper ${props.isSelected ? 'isSelected' : ''}`}>
				<sup className="footnote">{attrs.count}</sup>
			</span>

			<span className="render-wrapper">
				{attrs.value && <span dangerouslySetInnerHTML={{ __html: attrs.value }} />}
				{attrs.structuredValue && (
					<span dangerouslySetInnerHTML={{ __html: attrs.structuredHtml }} />
				)}
				{!attrs.value && !attrs.structuredValue && (
					<span className="empty-text">No Footnote text entered...</span>
				)}
			</span>
		</span>
	);
};

Footnote.propTypes = propTypes;
export default Footnote;
