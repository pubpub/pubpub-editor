import React, { PropTypes } from 'react';

import Autocomplete from './Autocomplete';
import CodeMirror from 'codemirror';
import Radium from 'radium';
import SimpleMDE from 'simplemde';
import { createMarkdownMention } from './autocompleteConfig';

let styles;
export const MarkdownEditor = React.createClass({
	propTypes: {
		initialContent: PropTypes.string,
		onChange: PropTypes.func,
		handleFileUpload: PropTypes.func,
		localUsers: PropTypes.array,
		localPubs: PropTypes.array,
		localFiles: PropTypes.array,
		localReferences: PropTypes.array,
		localHighlights: PropTypes.array,
		globalCategories: PropTypes.array,
	},

	simpleMDE: undefined,
	autocompleteMarker: undefined,

	getInitialState() {
		return {
			visible: undefined,
			top: 0,
			left: 0,
			input: '',
		};
	},

	componentDidMount() {
		const element = document.getElementById('myMarkdownEditor');
		if (element) {
			this.simpleMDE = new SimpleMDE({
				element: element,
				autoDownloadFontAwesome: false,
				autofocus: true,
				placeholder: 'Begin writing here...',
				spellChecker: false,
				status: false,
				toolbar: false,
				shortcuts: {
					togglePreview: null,
					toggleSideBySide: null,
					toggleFullScreen: null,
				}
			});

			this.simpleMDE.value(this.props.initialContent || '');
			this.simpleMDE.codemirror.on('cursorActivity', ()=> {
				if (this.props.onChange) {
					this.props.onChange(this.simpleMDE.value());
					const cm = this.simpleMDE.codemirror;
					const currentCursor = cm.getCursor();
					const currentLine = cm.getLine(currentCursor.line);
					const nextChIndex = currentCursor.ch;
					const nextCh = currentLine.length > nextChIndex ? currentLine.charAt(nextChIndex) : ' ';
					const prevChars = currentLine.substring(0, currentCursor.ch);
					const startIndex = prevChars.lastIndexOf(' ') + 1;
					const startLetter = currentLine.charAt(startIndex);
					const shouldMark = startLetter === '@' && nextCh === ' ' && !cm.getSelection();

					if (shouldMark && !this.autocompleteMarker) {
						this.autocompleteMarker = cm.markText({ line: currentCursor.line, ch: (prevChars.lastIndexOf(' ') + 1 )}, { line: currentCursor.line, ch: (prevChars.lastIndexOf(' ') + 2)}, {className: 'testmarker'});

						setTimeout(()=>{
							const container = document.getElementById('markdown-editor-container');
							const mark = document.getElementsByClassName('testmarker')[0];
							const top = mark.getBoundingClientRect().bottom - container.getBoundingClientRect().top;
							const left = mark.getBoundingClientRect().left - container.getBoundingClientRect().left;

							this.setState({
								visible: true,
								top: top,
								left: left,
								input: currentLine.substring(startIndex + 1, nextChIndex) || ' ',
							});
						}, 0);

					} else if (shouldMark) {
						this.setState({
							input: currentLine.substring(startIndex + 1, nextChIndex),
						});
					} else if (!shouldMark && this.autocompleteMarker) {
						this.autocompleteMarker.clear();
						this.autocompleteMarker = undefined;
						this.setState({
							visible: false,
						});
					}
				}
			});
			this.simpleMDE.codemirror.setOption('extraKeys', {
				Up: this.handleArrow,
				Down: this.handleArrow,
				Esc: this.handleEscape,
				Enter: this.handleEnter,
			});
		}
	},

	componentWillReceiveProps(nextProps) {
		if (this.props.initialContent !== nextProps.initialContent) {
			this.simpleMDE.value(nextProps.initialContent);
		}
	},

	handleArrow: function(cm) {
		if (!this.state.visible) { return CodeMirror.Pass; }
		return null;
	},

	handleEscape: function(cm) {
		this.setState({ visible: false });
		return CodeMirror.Pass;
	},

	handleEnter: function(cm) {
		if (!this.state.visible) { return CodeMirror.Pass; }
		return null;
	},

	onSelection: function(selectedObject) {
		const cm = this.simpleMDE.codemirror;
		createMarkdownMention(cm, selectedObject);
	},

	render() {
		return (
			<div id={'markdown-editor-container'} style={styles.container}>
				<Autocomplete
					top={this.state.top}
					left={this.state.left}
					visible={this.state.visible}
					input={this.state.input}
					onSelection={this.onSelection}
					localUsers={this.props.localUsers}
					localPubs={this.props.localPubs}
					localFiles={this.props.localFiles}
					localReferences={this.props.localReferences}
					localHighlights={this.props.localHighlights}
					globalCategories={this.props.globalCategories} />
				<textarea id={'myMarkdownEditor'} />
			</div>
		);
	},

});

export default Radium(MarkdownEditor);

styles = {
	container: {
		position: 'relative',
	},
};
