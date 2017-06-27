import React, { PropTypes } from 'react';

import ReactDOM from 'react-dom';
import RenderDocument from '../src/RenderDocument/RenderDocument';
import RichEditor from '../src/editorComponents/RichEditor';
import diffMarkdown from '../src/diff/diffMarkdown';
import { markdownToJSON } from '../src/markdown';

// requires style attributes that would normally be up to the wrapping library to require
require("@blueprintjs/core/dist/blueprint.css");
require("../style/base.scss");

export const StoryBookDiffEditor = React.createClass({

	getInitialState: function() {
		return {
			text1: '',
			text2: '',
			initialText1: markdownToJSON(this.props.text1),
			initialText2: markdownToJSON(this.props.text2),
		};
	},

	onChange1: function() {
		const markdown = this.refs.editor1.getMarkdown();
		this.setState({text1: markdown});
	},
	onChange2: function() {
		const markdown = this.refs.editor2.getMarkdown();
		this.setState({text2: markdown});
	},

	render: function() {
    const { text1, text2, initialText1, initialText2 } = this.state;
    const diffText = diffMarkdown(text1, text2);
		const jsonDoc = markdownToJSON(diffText);

		const itemStyle = {
			minWidth: 400
		};

		return (
			<div style={{display: 'flex'}}>
				<div style={itemStyle}>
					<RichEditor ref="editor1" initialContent={initialText1} onChange={this.onChange1}  />
				</div>
				<div style={itemStyle}>
					<RichEditor ref="editor2" initialContent={initialText2} onChange={this.onChange2} />
				</div>
				<div style={itemStyle}>
					<RenderDocument json={jsonDoc} allFiles={[]} allReferences={[]} />
				</div>
			</div>
		);
	}
});

export default StoryBookDiffEditor;
