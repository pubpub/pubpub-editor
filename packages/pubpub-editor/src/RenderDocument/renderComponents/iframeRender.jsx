import React, {PropTypes} from 'react';

import katex from 'katex';

// import katexStyles from './katex.css.js';

let styles = {};

export const IframeRender = React.createClass({
	propTypes: {
		url: PropTypes.string,
    width: PropTypes.string,
    height: PropTypes.string,
	},
	getInitialState: function() {
		return {
		};
	},

  renderDisplay() {
    const {url, width, height} = this.props;

    return (
      <iframe ref="iframe"
        frameBorder='0'
        src={url}
        style={{height ,width}}
        height={height}
        width={width}>
      </iframe>
    );
  },

	render: function() {
		return this.renderDisplay();
	}
});

export default IframeRender;
