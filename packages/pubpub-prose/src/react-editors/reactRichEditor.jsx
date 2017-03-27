import React, { PropTypes } from 'react';

import ReactDOM from 'react-dom';
import { RichEditor } from '../prosemirror-setup';

/*
Props outline:
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
		this.props.onChange();
  },

	getMarkdown() {
		return this.editor.toMarkdown();
	},

	getJSON() {
		return this.editor.toJSON();
	},

	createEditor(docJSON) {
    const {handleFileUpload, onError, mentionsComponent, initialState} = this.props;

    if (this.editor) {
      this.editor1.remove();
    }
    const place = ReactDOM.findDOMNode(this.refs.container);
		this.editor = new RichEditor({
			place: place,
			contents: initialState,
			components: {
				suggestComponent: mentionsComponent,
			},
			handlers: {
        createFile: handleFileUpload,
        captureError: onError,
        onChange: this.onChange,
				updateMentions: this.updateMentions,
      }
		});
	},

	updateMentions(mentions) {
		this.setState({mentions});
	},

	render: function() {
		const {mentions} = this.state;
		return (
			<div>
				<div>{mentions}</div>
				<div ref="container" className="pubEditor" id="pubEditor"></div>
			</div>
		);
	}

});

export default RichEditorWrapper;
