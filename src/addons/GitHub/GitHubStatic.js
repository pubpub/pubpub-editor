import React from 'react';
import PropTypes from 'prop-types';

require('./gitHub.scss');

const propTypes = {
};

const defaultProps = {
};

const GitHubStatic = function(props) {
	if (!props.url) { return null; }
	const gitHubUrl = props.handleResizeUrl ? props.handleResizeUrl(props.url) : props.url;
	return (
		<div>
			{'STATIC'} -- {gitHubUrl}
		</div>
	);
};

GitHubStatic.propTypes = propTypes;
GitHubStatic.defaultProps = defaultProps;
export default GitHubStatic;
