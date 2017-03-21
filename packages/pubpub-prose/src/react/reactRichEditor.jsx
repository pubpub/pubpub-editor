import React, { PropTypes } from 'react';

import ReactDOM from 'react-dom';
import { RichEditor } from '../index';

require("@blueprintjs/core/dist/blueprint.css");

/*
<Editor
    mentionsComponent={component}
    files={array}, // Array of file objects.
    handleFileUpload={function}
    fileUploadComplete={object} // Data about completed file upload
    onChange={function} // To update editorState which is managed above Editor
    initialState={object}
    />
*/


// var style = require('style-loader/useable!css-loader!../../prose/style/editor.css');
// var style = require('style-loader!raw-loader!../../prose/style/editor.css');
// style.use();

export const RichEditorWrapper = React.createClass({
	propTypes: {
	},

	getInitialState() {
		return {
			docJSON: null,
			fileMap: null,
		};
	},

	componentWillMount() {
	},

	componentDidMount() {
		this.createEditor(null);
	},

  componentWillUpdate(nextProps) {
    if (this.props) {

    }
  },

  onChange(editorState) {

  },

	createEditor(docJSON) {
    const {handleFileUpload, onError} = this.props;

    if (this.editor1) {
      this.editor1.remove();
    }
    const place = ReactDOM.findDOMNode(this.refs.container);
		this.editor1 = new RichEditor({
			place: place,
			contents: docJSON,
			handlers: {
        createFile: handleFileUpload,
        captureError: onError,
        onChange: this.onChange,
      }
		});
	},

	render: function() {
		return (
			<div>
				<div ref="container" className="pubEditor" id="pubEditor"></div>
			</div>
		);
	}

});

export default RichEditorWrapper;
