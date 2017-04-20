import React, { PropTypes } from 'react';

import filterXSS from 'xss';

export const HtmlRender = React.createClass({
	propTypes: {
		content: PropTypes.string,
	},
	getInitialState: function() {
		return {
		};
	},

  render() {
    const { content } = this.props;

    return (
      <div dangerouslySetInnerHTML={{ __html: filterXSS(content) }}>
      </div>
    );
  },
});

export default HtmlRender;
