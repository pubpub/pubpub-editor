import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';
import RichEditor from '../src/editorComponents/RichEditor';
import { markdownToJSON } from '../src/markdown/markdownToJson';

// requires style attributes that would normally be up to the wrapping library to require
require("@blueprintjs/core/dist/blueprint.css");
require("../style/base.scss");

export const StoryBookRichEditor = React.createClass({
	onChange: function() {
		const markdown = this.refs.editor.getMarkdown();
		const docJSON = markdownToJSON(markdown);
		/*
		console.log(JSON.stringify(this.refs.editor.getJSON()));
		console.log('Got markdown!');
		console.log(markdown);
		console.log(JSON.stringify(docJSON));
		*/
	},
	render: function() {
		return (
			<RichEditor ref="editor" onChange={this.onChange} {...this.props} />
		);
	}
});

export default StoryBookRichEditor;
