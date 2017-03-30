import React, { PropTypes } from 'react';

export const MentionComponent = React.createClass({
	propTypes: {
		text: PropTypes.string,
		url: PropTypes.string,
		type: PropTypes.string,
	},
	getInitialState: function() {
    return {};
	},
	getDefaultProps: function() {
	},

  componentDidMount: function() {
  },

  render() {
    const { url, type, text } = this.props;
    return (
      <a className="mention" href={url}>@{text}</a>
    );
  }
});

export default MentionComponent;
