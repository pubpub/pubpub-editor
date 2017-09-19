import React from 'react';
import PropTypes from 'prop-types';
import katex from 'katex';

require('./latex.scss');

const propTypes = {
	value: PropTypes.string,
	block: PropTypes.bool,
};

const defaultProps = {
	value: '',
	block: false,
};

const LatexEditor = function(props) {
	const displayHTML = katex.renderToString(props.value, {
		displayMode: props.block,
		throwOnError: false
	});
	return (
		<span
			className={`latex-wrapper ${props.block ? 'block' : ''}`}
			dangerouslySetInnerHTML={{ __html: displayHTML }}
		/>
	);
};

LatexEditor.propTypes = propTypes;
LatexEditor.defaultProps = defaultProps;
export default LatexEditor;
