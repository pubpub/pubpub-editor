import React, { PropTypes } from 'react';

import Autocomplete from '../Autocomplete/Autocomplete';
import FormattingMenu from '../FormattingMenu/FormattingMenu';
import InsertMenu from '../InsertMenu/InsertMenu';
import { RichEditor as ProseEditor } from '../prosemirror-setup';
// import ReactDOM from 'react-dom';
import { createRichMention } from '../Autocomplete/autocompleteConfig';

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
		// Should be called on every document change (delete, addition, etc)
		this.props.onChange(this.editor.view.state.toJSON().doc);

		// Should be called on every cursor update
		this.insertMenu.updateInputPosition(this.editor.view);
		this.updateCoordsForMenus();
	},

	updateCoordsForMenus: function() {
		const currentPos = this.editor.view.state.selection.$to.pos;

		const currentNode = this.editor.view.state.doc.nodeAt(currentPos - 1);
		const isRoot = this.editor.view.state.selection.$to.depth === 2;

		const container = document.getElementById('rich-editor-container');

		if (!this.editor.view.state.selection.$cursor && currentNode && currentNode.text) {
			const currentFromPos = this.editor.view.state.selection.$from.pos;
			const currentToPos = this.editor.view.state.selection.$to.pos;
			const left = this.editor.view.coordsAtPos(currentFromPos).left - container.getBoundingClientRect().left;
			const right = this.editor.view.coordsAtPos(currentToPos).right - container.getBoundingClientRect().left;
			const inlineCenter = left + ((right - left) / 2);
			const inlineTop = this.editor.view.coordsAtPos(currentFromPos).top - container.getBoundingClientRect().top;
			return this.setState({
				inlineCenter: inlineCenter,
				inlineTop: inlineTop,
			});
		}

		return this.setState({
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
				referencesList: this.props.localFiles,
			},
			props: {
				fileMap: fileMap,
				referencesList: this.props.localFiles,
				createFile: this.props.handleFileUpload,
				createReference: this.props.handleReferenceAdd,
				captureError: this.props.onError,
				onChange: this.onChange,
				updateMentions: this.updateMentions,
			},
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
				if (!container || !mark) {
					return this.setState({ visible: false });
				}
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

					<InsertMenu
						ref={(input) => { this.insertMenu = input; }}
						editor={this.editor}
						handleFileUpload={this.props.handleFileUpload}
						handleReferenceAdd={this.props.handleReferenceAdd} />

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
