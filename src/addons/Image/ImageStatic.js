import React, {PropTypes} from 'react';

import katex from 'katex';

const propTypes = {
	value: PropTypes.string,
	block: PropTypes.bool,
};

const defaultProps = {
	value: '',
	block: false,
};

const LatexEditor = function(props) {
	const displayHTML = "test";
	return (
		<span
		  	className={`latex-wrapper ${props.block ? 'block' : ''}`}
		  	dangerouslySetInnerHTML={{__html: displayHTML}}
	  	/>
	);
};

LatexEditor.propTypes = propTypes;
LatexEditor.defaultProps = defaultProps;
export default LatexEditor;
