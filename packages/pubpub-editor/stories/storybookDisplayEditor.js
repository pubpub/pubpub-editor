import React, { PropTypes } from 'react';

import CodeEditor from '../src/editorComponents/CodeEditor';
import jsx from 'jsx-transform';

let styles = {};

function RenderedPubs(props) {
  console.log(props.n, Array(props.n));
  return (<ul>
    {Array(props.n).fill().map((n, index) => {
      return <li>{props.name} {index}</li>
    })}
    </ul>
  );
}

export const StoryBookCodeEditor = React.createClass({
  getInitialState: function() {
    return {
      elem: null
    };
  },
	onChange: function(item) {
		console.log(item);
    try {
      const createElem = React.createElement;
      const compiled = jsx.fromString(item, {
        factory: 'createElem'
      });
      const elem = eval(compiled);
      console.log('compiled', compiled, elem);
      this.setState({elem});

    } catch (err) {
      console.log(err);
    }
	},

	render: function() {
    const { elem } = this.state;
    const DisplayElem = elem;
		return (
      <div style={styles.container}>
        <div style={styles.item}>
			    <CodeEditor onChange={this.onChange} initialContent={'<div><h1>JODS</h1><RenderedPubs n={5} name="Pub"/></div>'} {...this.props} />
        </div>
        {(elem) ?
          <div style={styles.item}>elem</div> : null}
      </div>
		);
	}
});

styles = {
  container: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'nowrap',
    justifyContent: 'space-around'
  },
  item: {
    width: '50%',
    flexGrow: 2,
  }
}

export default StoryBookCodeEditor;
