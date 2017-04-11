import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';
import CodeEditor from '../src/editorComponents/CodeEditor';


export const StoryBookCodeEditor = React.createClass({
	onChange: function(item) {
		console.log(item);
	},

	render: function() {
		return (
			<CodeEditor onChange={this.onChange} initialContent={'Hello'} {...this.props} />
		);
	}
});

export default StoryBookCodeEditor;
