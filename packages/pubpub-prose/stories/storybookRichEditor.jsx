import React, { PropTypes } from 'react';

import ReactDOM from 'react-dom';
import RichEditor from '../src/react/reactRichEditor';
import suggestComponent from '../src/react/baseSuggest';

// requires style attributes that would normally be up to the wrapping library to require
require("@blueprintjs/core/dist/blueprint.css");
require("../style/base.scss");

export const StoryBookRichEditor = React.createClass({
	onChange: function() {
		const markdown = this.refs.editor.getMarkdown();
		console.log('Got markdown!');
		console.log(markdown);
	},
	render: function() {
		const mentionsComponent = {
			component: suggestComponent,
			props: {files: ['A', 'B', 'C']}
		};
		return (
			<RichEditor ref="editor" onChange={this.onChange} mentionsComponent={mentionsComponent} {...this.props} />
		);
	}
});

export default StoryBookRichEditor;
