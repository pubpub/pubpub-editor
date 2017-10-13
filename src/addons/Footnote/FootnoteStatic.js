import React from 'react';
import PropTypes from 'prop-types';
import katex from 'katex';

require('./footnoteAddon.scss');

const propTypes = {
	value: PropTypes.string,
	isBlock: PropTypes.bool,
};

const defaultProps = {
	value: '',
	isBlock: false,
};

const FootnoteStatic = function(props) {
	const displayHTML = katex.renderToString(props.value, {
		displayMode: props.isBlock,
		throwOnError: false
	});
	return (
		<sup className={'footnote editable-render'}>{this.props.count}</sup>
	);
};

FootnoteStatic.propTypes = propTypes;
FootnoteStatic.defaultProps = defaultProps;
export default FootnoteStatic;
