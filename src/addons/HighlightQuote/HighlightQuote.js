import React from 'react';
import PropTypes from 'prop-types';

require('./highlightQuote.scss');

const propTypes = {
	to: PropTypes.number,
	from: PropTypes.number,
	id: PropTypes.string,
	exact: PropTypes.string,
	suffix: PropTypes.string,
	prefix: PropTypes.string,
	version: PropTypes.string,
	isSelected: PropTypes.bool,
};

const defaultProps = {
	to: undefined,
	from: undefined,
	id: undefined,
	exact: undefined,
	suffix: undefined,
	prefix: undefined,
	version: undefined,
	isSelected: false,
};

const Highlight = function(props) {
	if (!props.exact) { return null; }
	return (
		<div className={`pt-card pt-elevation-2 highlight-quote ${props.isSelected ? 'isSelected' : ''}`}>
			{props.prefix}
			<span className={'highlight-text'}>{props.exact}</span>
			{props.suffix}
		</div>
	);
};

Highlight.propTypes = propTypes;
Highlight.defaultProps = defaultProps;
export default Highlight;
