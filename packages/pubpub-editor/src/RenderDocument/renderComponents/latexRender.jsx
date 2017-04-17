import Radium, {Style} from 'radium';
import React, {PropTypes} from 'react';

import ReactDOM from 'react-dom';
import katex from 'katex';
import katexStyles from './katex.css.js';

let styles = {};

export const LatexEditor = React.createClass({
	propTypes: {
		value: PropTypes.string,
    block: PropTypes.bool,
	},
	getInitialState: function() {
    const displayHTML = this.generateHTML(this.props.value);
		return {
      editing: false,
      displayHTML,
		};
	},
  generateHTML(text) {
    return katex.renderToString(text, {displayMode: this.props.block, throwOnError: false});
  },

  renderDisplay() {
    const {displayHTML} = this.state;
    const {value, block} = this.props;

    return (
      <span style={styles.display({block})}>
        <Style rules={ katexStyles } />
	        <span
						ref={'latexElem'}
						className={'pub-embed-latex'}
	          dangerouslySetInnerHTML={{__html: displayHTML}}>
	        </span>
      </span>
    );
  },


	render: function() {
		return this.renderDisplay();
	}
});

styles = {
  display: function({block})  {
    return {
      fontSize: (block) ? '20px' : '0.9em',
    };
  },
};

export default LatexEditor;
