import React, { PropTypes } from 'react';
import { jsonToMarkdown, markdownToJSON } from '../markdown';

import { renderReactFromJSON } from './renderReactFromJSON';

// import ReactDOM from 'react-dom';

export const RenderDocument = React.createClass({
	propTypes: {
    json: PropTypes.object,
    markdown: PropTypes.string,
		localFiles: PropTypes.array,
		localReferences: PropTypes.array,
	},
	getInitialState() {
		return { };
	},

	componentWillMount() {
	},


	generateFileMap: function() {
		const files = this.props.localFiles || [];
		const fileMap = {};
		for (const file of files) {
			fileMap[file.name] = file.url;
		}
		return fileMap;
	},

	render: function() {

    const { json, markdown, localReferences, localFiles } = this.props;

    let renderedJSON;
    if (markdown) {
      renderedJSON = markdownToJSON(markdown, localReferences);
    } else {
      renderedJSON = json;
    }

		return (
			<div className="pub-body">
				{renderReactFromJSON(renderedJSON, this.generateFileMap())}
			</div>
		);
	}

});

export default RenderDocument;
