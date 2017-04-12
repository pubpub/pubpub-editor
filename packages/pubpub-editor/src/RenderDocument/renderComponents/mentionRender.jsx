import React, {PropTypes} from 'react';

import classNames from 'classnames';

export const MentionComponent = React.createClass({
	propTypes: {
		url: PropTypes.string,
    type: PropTypes.string,
	},
	getInitialState: function() {
    return {};
	},

  render() {

    const { url, type, children } = this.props;
    return (
      <a className="mention" href={url}>{children}</a>
    );
  }
});


export default MentionComponent;
