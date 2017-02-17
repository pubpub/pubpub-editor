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
	          dangerouslySetInnerHTML={{__html: displayHTML}}
	          style={styles.output}>
	        </span>
      </span>
    );
  },


	render: function() {
		return this.renderDisplay();
	}
});

styles = {
  wrapper: {
    backgroundColor: 'blue',
  },
  block: {
    position: 'absolute',
    left: '0px',
    fontSize: '15px',
    border: '1px solid black',
    borderRadius: '1px',
    width: '100px',
    height: '25px',
    lineHeight: '25px',
    width: 'auto',
    padding: '3px 6px',
    marginTop: '5px',
    cursor: 'pointer',
  },
  display: function({block})  {
    return {
      fontSize: (block) ? '20px' : '0.9em',
    };
  },
};

export default LatexEditor;
