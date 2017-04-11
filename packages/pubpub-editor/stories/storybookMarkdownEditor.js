import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';
import MarkdownEditor from '../src/editorComponents/MarkdownEditor';
import { markdownToJSON } from '../src/markdown/markdownToJson';

// requires style attributes that would normally be up to the wrapping library to require
require("@blueprintjs/core/dist/blueprint.css");
require("../style/markdown.scss");

export const StoryBookMarkdownEditor = React.createClass({
	onChange: function() {
		// const markdown = this.refs.editor.getMarkdown();
		// const docJSON = markdownToJSON(markdown);
		/*
		console.log(JSON.stringify(this.refs.editor.getJSON()));
		console.log('Got markdown!');
		console.log(markdown);
		console.log(JSON.stringify(docJSON));
		*/
	},
	render: function() {
		return (
			<MarkdownEditor ref="editor" onChange={this.onChange} {...this.props} />
		);
	}
});

export default StoryBookMarkdownEditor;
