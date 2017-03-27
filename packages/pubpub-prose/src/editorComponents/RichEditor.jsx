import React, { PropTypes } from 'react';

import Autocomplete from './Autocomplete';
import { RichEditor as ProseEditor } from '../prosemirror-setup';
import ReactDOM from 'react-dom';

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


export const RichEditor = React.createClass({
	propTypes: {
	},

	getInitialState() {
		return {
			// docJSON: null,
			// fileMap: null,
			visible: undefined,
			top: 0,
			left: 0,
			input: '',
		};
	},

	componentWillMount() {
	},

	componentDidMount() {
		this.createEditor(null);
	},

	componentWillUpdate(nextProps) {

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
		this.editor = new ProseEditor({
			place: place,
			contents: initialState,
			// components: {
			// 	suggestComponent: mentionsComponent,
			// },
			handlers: {
				createFile: handleFileUpload,
				captureError: onError,
				onChange: this.onChange,
				updateMentions: this.updateMentions,
			}
		});
	},

	updateMentions(mentionInput) {
		if (!!mentionInput) {
			setTimeout(()=>{
				const container = document.getElementById('rich-editor-container');
				const mark = document.getElementsByClassName('mention-marker')[0];
				const top = mark.getBoundingClientRect().bottom - container.getBoundingClientRect().top;
				const left = mark.getBoundingClientRect().left - container.getBoundingClientRect().left;
				this.setState({
					visible: true,
					top: top,
					left: left,
					input: mentionInput,
				});
			}, 0);
		} else {
			this.setState({ visible: false });
		}
	},

	createMention: function(text) {
		return this.editor.createMention();
	},

	mentionStyle: function(top, left, visible) {
		return {
			zIndex: 10,
			position: 'absolute',
			left: left,
			top: top,
			opacity: visible ? 1 : 0,
			pointerEvents: visible ? 'auto' : 'none',
			transition: '.1s linear opacity'
		};
	},

	render: function() {
		const autocompleteStyle = this.mentionStyle(this.state.top, this.state.left, this.state.visible);
		return (
			<div style={{ position: 'relative' }} id={'rich-editor-container'}>
				<Autocomplete style={autocompleteStyle} input={this.state.input} />
				<div ref="container" className="pubEditor" id="pubEditor"></div>
			</div>
		);
	}

});

export default RichEditor;
