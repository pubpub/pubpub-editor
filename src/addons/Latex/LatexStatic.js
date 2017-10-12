import React from 'react';
import PropTypes from 'prop-types';
import katex from 'katex';

require('./latexAddon.scss');

const propTypes = {
	value: PropTypes.string,
	isBlock: PropTypes.bool,
};

const defaultProps = {
	value: '',
	isBlock: false,
};

const LatexEditor = function(props) {
	const displayHTML = katex.renderToString(props.value, {
		displayMode: props.isBlock,
		throwOnError: false
	});
	return (
		<div
			className={`latex-wrapper ${props.isBlock ? 'block' : ''}`}
			dangerouslySetInnerHTML={{ __html: displayHTML }}
		/>
	);
};

LatexEditor.propTypes = propTypes;
LatexEditor.defaultProps = defaultProps;
export default LatexEditor;
