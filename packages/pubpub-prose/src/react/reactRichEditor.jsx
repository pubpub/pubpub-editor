import React, { PropTypes } from 'react';

import ReactDOM from 'react-dom';
import { RichEditor } from '../index';

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
    const {handleFileUpload, onError, mentionsComponent} = this.props;

    if (this.editor1) {
      this.editor1.remove();
    }
    const place = ReactDOM.findDOMNode(this.refs.container);
		this.editor1 = new RichEditor({
			place: place,
			contents: docJSON,
			components: {
				suggestComponent: mentionsComponent,
			},
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
