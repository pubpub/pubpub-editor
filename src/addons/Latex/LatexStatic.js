import React from 'react';
import PropTypes from 'prop-types';
// import katex from 'katex';

require('./latexAddon.scss');

const propTypes = {
	// value: PropTypes.string,
	html: PropTypes.string.isRequired,
	isBlock: PropTypes.bool,
};

const defaultProps = {
	// value: '',
	isBlock: false,
};

const LatexStatic = function(props) {
	// const displayHTML = katex.renderToString(props.value, {
	// 	displayMode: props.isBlock,
	// 	throwOnError: false
	// });
	return (
		<div
			className={`latex-wrapper ${props.isBlock ? 'block' : ''}`}
			dangerouslySetInnerHTML={{ __html: props.html }}
		/>
	);
};

LatexStatic.propTypes = propTypes;
LatexStatic.defaultProps = defaultProps;
export default LatexStatic;
