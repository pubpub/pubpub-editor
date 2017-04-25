import React, { PropTypes } from 'react';

import FullEditor from './storybookFullEditor';
import ReactDOM from 'react-dom';
import request from 'superagent';

export const StoryBookAPI = React.createClass({
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
  getPub: function() {
    const slug = this.refs.slug.value;
    const file = this.refs.file.value;
    request
    .get(`https://www.pubpub.org/api/pub?slug=${slug}`)
    .end(function(err, res) {
      console.log(res);
    });
  },
	render: function() {
		return (
      <div>
        <input className="pt-input" ref="slug" type="text" />
        <input className="pt-input" ref="file" type="text" />
        <a onClick={this.getPub} role="button" className="pt-button" tabindex="0">Submit</a>
        <FullEditor mode={'markdown'} initialContent={''} />
			</div>
		);
	}
});

export default StoryBookAPI;
