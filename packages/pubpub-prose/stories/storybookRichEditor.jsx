import React, { PropTypes } from 'react';

import ReactDOM from 'react-dom';
import RichEditor from '../src/react-editors//reactRichEditor';
import { markdownToJSON } from '../src/markdown/markdownToJson';
import suggestComponent from '../src/react-editors/baseSuggest';

// requires style attributes that would normally be up to the wrapping library to require
require("@blueprintjs/core/dist/blueprint.css");
require("../style/base.scss");

export const StoryBookRichEditor = React.createClass({
	onChange: function() {
		console.log(JSON.stringify(this.refs.editor.getJSON()));
		const markdown = this.refs.editor.getMarkdown();
		const docJSON = markdownToJSON(markdown);
		console.log('Got markdown!');
		console.log(markdown);
		console.log(JSON.stringify(docJSON));
	},
	render: function() {
		const mentionsComponent = {
			component: suggestComponent,
			props: {
				suggestionCategories: ['files', 'references', 'users', 'figures'],
				getSuggestionsByCategory: function ({value, suggestionCategory}) {
					// this will automatically be filtered
					return new Promise((resolve, reject) => {
						let result;
						switch (suggestionCategory) {
							case 'files':
								result = ['A.jpg','B.jpg'];
								break;
							case 'references':
								result = ['Design & Science - Joi Ito','Design as Participation - Kevin Slavin'];
								break;
							case 'users':
								result = ['Thariq', 'Travis', 'Hassan'];
								break;
							case 'figures':
								result = ['Figure 1', 'Figure 2'];
								break;
						}
						console.log('getting', result, suggestionCategory);
						resolve(result);
					});
				},
			}
		};
		return (

			<RichEditor ref="editor" onChange={this.onChange} mentionsComponent={mentionsComponent} {...this.props} />
		);
	}
});

export default StoryBookRichEditor;
