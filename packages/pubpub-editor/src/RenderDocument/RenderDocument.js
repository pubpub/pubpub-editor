import React, { PropTypes } from 'react';
import { jsonToMarkdown, markdownToJSON } from '../markdown';

import { renderReactFromJSON } from './renderReactFromJSON';

// import ReactDOM from 'react-dom';

export const RenderDocument = React.createClass({
	propTypes: {
    json: PropTypes.object,
    markdown: PropTypes.string,
		allFiles: PropTypes.array,
		allReferences: PropTypes.array,
		slug: PropTypes.string,
	},
	getInitialState() {
		return { };
	},

	componentWillMount() {
	},


	generateFileMap: function() {
		const files = this.props.allFiles || [];
		const fileMap = {};
		for (const file of files) {
			fileMap[file.name] = file.url;
		}
		return fileMap;
	},

	render: function() {

    const { json, markdown, allReferences, allFiles, slug } = this.props;

    let renderedJSON;
    if (markdown) {
      renderedJSON = markdownToJSON(markdown, allReferences);
    } else {
      renderedJSON = json;
    }


		return (
			<div className="pub-body">
				{renderReactFromJSON(renderedJSON, this.generateFileMap(), allReferences, slug)}
			</div>
		);
	}

});

export default RenderDocument;
