import React from 'react';
import PropTypes from 'prop-types';

require('./highlightQuote.scss');

const propTypes = {
	attrs: PropTypes.object.isRequired,
	options: PropTypes.object.isRequired,
	isSelected: PropTypes.bool.isRequired,
	// isEditable: PropTypes.bool.isRequired,
};

const HighlightQuote = (props) => {
	const attrs = props.attrs;
	const options = props.options;
	const generateActionElement = options.generateActionElement;

	if (!attrs.exact) {
		return null;
	}
	return (
		<div className={`highlight-quote ${props.isSelected ? 'isSelected' : ''}`}>
			<div className="quote-text">{attrs.exact}</div>
			{generateActionElement && (
				<div className="action-element">{generateActionElement(props)}</div>
			)}
		</div>
	);
};

HighlightQuote.propTypes = propTypes;
export default HighlightQuote;
