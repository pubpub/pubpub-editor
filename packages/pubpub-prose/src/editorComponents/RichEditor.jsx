import React, { PropTypes } from 'react';

import Autocomplete from '../Autocomplete/Autocomplete';
import FormattingMenu from '../FormattingMenu/FormattingMenu';
import InsertMenu from '../InsertMenu/InsertMenu';
import { RichEditor as ProseEditor } from '../prosemirror-setup';
// import ReactDOM from 'react-dom';
import { createRichMention } from '../Autocomplete/autocompleteConfig';

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
		initialContent: PropTypes.object,
		onChange: PropTypes.func,
		handleFileUpload: PropTypes.func,
		handleReferenceAdd: PropTypes.func,

		localUsers: PropTypes.array,
		localPubs: PropTypes.array,
		localFiles: PropTypes.array,
		localReferences: PropTypes.array,
		localHighlights: PropTypes.array,
		localPages: PropTypes.array,
		globalCategories: PropTypes.array,
	},

	getInitialState() {
		return {
			// docJSON: null,
			// fileMap: null,
			visible: undefined,
			top: 0,
			left: 0,
			input: '',
			menuTop: 7,
			inlineCenter: 0,
			inlineTop: 0,
		};
	},

	componentWillMount() {
	},

	componentDidMount() {
		this.createEditor(null);
	},

	onChange() {
		this.props.onChange(this.editor.view.state.toJSON().doc);
		// this.props.onChange(this.editor.view.state.doc);
		this.updateCoordsForMenus();
	},

	updateCoordsForMenus: function() {
		const currentPos = this.editor.view.state.selection.$to.pos;

		const currentNode = this.editor.view.state.doc.nodeAt(currentPos - 1);
		const isRoot = this.editor.view.state.selection.$to.depth === 2;

		const container = document.getElementById('rich-editor-container');
		const menuTop = isRoot && currentNode && !currentNode.text ? this.editor.view.coordsAtPos(currentPos).top - container.getBoundingClientRect().top + 5 : 0;

		if (!this.editor.view.state.selection.$cursor && currentNode && currentNode.text) {
			const currentFromPos = this.editor.view.state.selection.$from.pos;
			const currentToPos = this.editor.view.state.selection.$to.pos;
			const left = this.editor.view.coordsAtPos(currentFromPos).left - container.getBoundingClientRect().left;
			const right = this.editor.view.coordsAtPos(currentToPos).right - container.getBoundingClientRect().left;
			const inlineCenter = left + ((right - left) / 2);
			const inlineTop = this.editor.view.coordsAtPos(currentFromPos).top - container.getBoundingClientRect().top;
			return this.setState({
				menuTop: menuTop,
				inlineCenter: inlineCenter,
				inlineTop: inlineTop,
			});
		}

		return this.setState({
			menuTop: menuTop,
			inlineTop: 0,
			inlineCenter: 0,
		});
	},

	getMarkdown() {
		return this.editor.toMarkdown();
	},

	getJSON() {
		return this.editor.toJSON();
	},

	createEditor(docJSON) {
		if (this.editor) {
			this.editor1.remove();
		}

		// const place = ReactDOM.findDOMNode(this.refs.container);
		const place = document.getElementById('pubEditor');
		const fileMap = this.generateFileMap();
		this.editor = new ProseEditor({
			place: place,
			contents: this.props.initialContent,
			config: {
				fileMap: fileMap,
			},
			// components: {
			// 	suggestComponent: mentionsComponent,
			// },
			handlers: {
				createFile: this.props.handleFileUpload,
				captureError: this.props.onError,
				onChange: this.onChange,
				updateMentions: this.updateMentions,
			}
		});
	},

	updateMentions(mentionInput) {
		if (mentionInput) {
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

	onMentionSelection: function(selectedObject) {
		const mentionPos = this.editor.getMentionPos();
		createRichMention(this.editor, selectedObject, mentionPos.start, mentionPos.end);
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

		return (
			<div style={{ position: 'relative' }} id={'rich-editor-container'}>
				<Autocomplete
					top={this.state.top}
					left={this.state.left}
					visible={this.state.visible}
					input={this.state.input}
					onSelection={this.onMentionSelection}
					localUsers={this.props.localUsers}
					localPubs={this.props.localPubs}
					localFiles={this.props.localFiles}
					localReferences={this.props.localReferences}
					localHighlights={this.props.localHighlights}
					localPages={this.props.localPages}
					globalCategories={this.props.globalCategories} />

				{!!this.state.menuTop &&
					<InsertMenu
						editor={this.editor}
						top={this.state.menuTop}
						handleFileUpload={this.props.handleFileUpload}
						handleReferenceAdd={this.props.handleReferenceAdd} />
				}

				{this.editor && !!this.state.inlineTop &&
					<FormattingMenu
						editor={this.editor}
						top={this.state.inlineTop}
						left={this.state.inlineCenter} />
				}

				<div className="pubEditor" id="pubEditor" />
			</div>
		);
	}

});

export default RichEditor;
