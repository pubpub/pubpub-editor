import React from 'react';
import PropTypes from 'prop-types';

require('./component.scss');

const propTypes = {
	text: PropTypes.string,
};

const defaultProps = {
	text: 'Oops',
};

const Template = function(props) {
	return (
		<div className={'template'}>
			{props.text}
		</div>
	);
};

Template.defaultProps = defaultProps;
Template.propTypes = propTypes;
export default Template;
