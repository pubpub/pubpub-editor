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
			visible: undefined,
			top: 0,
			left: 0,
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
		// console.log(editorState, other, other2)
		// console.log(this.editor.view);
		// console.log(this.editor.view.state);
		// const currentPos = this.editor.view.state.selection.$to;
		// console.log(currentPos.pos);
		// const currentNode = this.editor.view.state.doc.nodeAt(currentPos.pos - 1);
		// console.log(currentNode);
		// if (currentNode && currentNode.text) {
		// 	// const prevChars = currentNode.text.substring(0, currentPos.parentOffset);
		// 	// console.log(prevChars);
		// 	// const nextCh = currentPos.parentOffset < currentNode.text.length ? currentNode.text.charAt(currentPos.parentOffset + 1) : ' ';
		// 	// const startIndex = prevChars.lastIndexOf(' ') + 1;
		// 	// const startLetter = currentNode.text.charAt(startIndex);
		// 	// const shouldMark = startLetter === '@' && nextCh === ' ';
		// 	// console.log(shouldMark);
		// 	const currentLine = currentNode.text;
		// 	const nextChIndex = currentPos.parentOffset;
		// 	const nextCh = currentLine.length > nextChIndex ? currentLine.charAt(nextChIndex) : ' ';
		// 	// console.log(currentCursor);
		// 	const prevChars = currentLine.substring(0, currentPos.parentOffset );
		// 	const startIndex = Math.max(prevChars.lastIndexOf(' ') + 1, prevChars.lastIndexOf(' ') + 1);
		// 	const startLetter = currentLine.charAt(startIndex);
		// 	// console.log(prevChars.lastIndexOf(' ') + 1, currentCursor.ch);
		// 	const shouldMark = startLetter === '@' && (nextCh.charCodeAt(0) === 32 || nextCh.charCodeAt(0) === 160);
		// 	// console.log('currentLine ', JSON.stringify(currentLine));
		// 	// console.log('currentPos.parentOffset', currentPos.parentOffset);
		// 	// console.log('nextChIndex ', nextChIndex);
		// 	// console.log("prevChars.lastIndexOf(' ')", prevChars.lastIndexOf(' '));
		// 	// console.log('char code', currentLine.charCodeAt(nextChIndex))
		// 	// console.log('currentLine.length ', currentLine.length);
		// 	// console.log('prevChars ', JSON.stringify(prevChars));
		// 	// console.log('startIndex ', startIndex);
		// 	// console.log('startLetter ', JSON.stringify(startLetter));
		// 	// console.log('nextCh ', JSON.stringify(nextCh));
		// 	console.log(shouldMark);
		// 	if (shouldMark) {
		// 		const newDecorations = DecorationSet.create(this.editor.view.state.doc, [Decoration.inline(currentPos.parentOffset - 3, currentPos.parentOffset - 1)])
		// 		this.editor.view.setProps({ decorations: newDecorations });
		// 		// this.editor.view.markRange(currentPos.parentOffset - 3, currentPos.parentOffset - 1, {className: 'yooo'});
		// 	}
		// }
		
		// // const nextChIndex = currentCursor.ch;
		// // const nextCh = currentLine.length > nextChIndex ? currentLine.charAt(nextChIndex) : ' ';
		// // // console.log(currentCursor);
		// // const prevChars = currentLine.substring(0, currentCursor.ch);
		// // const startIndex = prevChars.lastIndexOf(' ') + 1;
		// // const startLetter = currentLine.charAt(startIndex);
		// // // console.log(prevChars.lastIndexOf(' ') + 1, currentCursor.ch);
		// // const shouldMark = startLetter === '@' && nextCh === ' ' && !cm.getSelection();


		// // debugger;

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
		// this.setState({mentions});

		if (mentions === 'hi') {
			setTimeout(()=>{
				const container = document.getElementById('rich-editor-container');
				const mark = document.getElementsByClassName('mention-marker')[0];
				// console.log(container, mark);
				const top = mark.getBoundingClientRect().bottom - container.getBoundingClientRect().top;
				const left = mark.getBoundingClientRect().left - container.getBoundingClientRect().left;
				this.setState({
					visible: true,
					top: top,
					left: left,
				});
			}, 0);
		} else {
			this.setState({
				visible: false,
			});
		}
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
		const {mentions} = this.state;
		return (
			<div style={{ position: 'relative' }} id={'rich-editor-container'}>
				<div className={'pt-card pt-elevation-4'} style={this.mentionStyle(this.state.top, this.state.left, this.state.visible)}>
					Autocomplete me!
				</div>
				<div ref="container" className="pubEditor" id="pubEditor"></div>
			</div>
		);
	}

});

export default RichEditorWrapper;
