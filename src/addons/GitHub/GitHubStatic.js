import React from 'react';
import PropTypes from 'prop-types';

require('./gitHub.scss');

const propTypes = {
	url: PropTypes.string
};

const defaultProps = {
};

const GitHubStatic = function(props) {
	if (!props.url) { return null; }
	const gitHubUrl = props.handleResizeUrl ? props.handleResizeUrl(props.url) : props.url;
	return (
		<div className="github-wrapper pt-card pt-elevation-2">
			<div className="github-static">
				<div>{this.props.url}</div>
			</div>
		</div>
	);
};

GitHubStatic.propTypes = propTypes;
GitHubStatic.defaultProps = defaultProps;
export default GitHubStatic;
