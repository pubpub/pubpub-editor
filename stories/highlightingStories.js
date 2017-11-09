import React, { Component } from 'react';
import { storiesOf } from '@storybook/react';
import { Editor } from 'index';
import Latex from 'addons/Latex/LatexAddon';
import Image from 'addons/Image/ImageAddon';
import InsertMenu from 'addons/InsertMenu/InsertMenu';
import HighlightMenu from 'addons/HighlightMenu/HighlightMenu';
import HighlightQuote from 'addons/HighlightQuote/HighlightQuoteAddon';
import { editorWrapperStyle, s3Upload, renderLatex } from './_utilities';
import plainDoc from './initialDocs/plainDoc';
import highlightQuoteDoc from './initialDocs/highlightQuoteDoc';

class Highlighting extends Component {
	constructor(props) {
		super(props);
		this.editor = undefined;
		this.getHighlightContent = this.getHighlightContent.bind(this);
	}
	getHighlightContent(from, to) {
		const primaryEditorState = this.editor.state.editorState;
		let exact = '';
		primaryEditorState.doc.slice(from, to).content.forEach((sliceNode)=>{ exact += sliceNode.textContent; });
		let prefix = '';
		primaryEditorState.doc.slice(Math.max(0, from - 10), Math.max(0, from)).content.forEach((sliceNode)=>{ prefix += sliceNode.textContent; });
		let suffix = '';
		primaryEditorState.doc.slice(Math.min(primaryEditorState.doc.nodeSize - 2, to), Math.min(primaryEditorState.doc.nodeSize - 2, to + 10)).content.forEach((sliceNode)=>{ suffix += sliceNode.textContent; });
		return {
			exact: exact,
			prefix: prefix,
			suffix: suffix,
		};
	}
	render() {
		return (
			<div>
				<div style={editorWrapperStyle} className={'selection-cite-wrapper'}>
					<Editor onChange={this.onChange} ref={(ref)=> { this.editor = ref; }} placeholder={'Begin writing...'} initialContent={plainDoc}>
						<HighlightMenu
							highlights={[
								{
									from: 277,
									to: 289,
									id: 'initfakeid1',
									hash: 'whateverhash',
									exact: 'is a new',
									prefix: 'hello this ',
									suffix: ' sentence.',
									version: 'asd-asd-asd',
								},
								{
									from: 277,
									to: 289,
									id: 'initfakeid2',
									hash: 'whateverhash',
									exact: 'is a new',
									prefix: 'hello this ',
									suffix: ' sentence.',
									// permanent: true,
								},
							]}
							primaryEditorClassName={'selection-cite-wrapper'}
							onNewDiscussion={(data)=>{
								console.log('New discussion', data);
							}}
							onDotClick={(thing)=> {
								console.log('Clicked selection ', thing);
							}}
							// versionId={'1233-asd3-as23-asf3'}
						/>
						<InsertMenu />
						<Latex renderFunction={renderLatex} />
						<Image handleFileUpload={s3Upload} />
					</Editor>
				</div>

				<div style={editorWrapperStyle}>
					<Editor
						placeholder={'Begin writing...'}
						initialContent={highlightQuoteDoc}
					>
						<HighlightQuote
							getHighlightContent={this.getHighlightContent}
							hoverBackgroundColor={'red'}
						/>
						<InsertMenu />
						<Latex renderFunction={renderLatex} />
						<Image handleFileUpload={s3Upload} />
					</Editor>
				</div>
			</div>
		);
	}
}

storiesOf('Highlighting', module)
.add('default', () => (
	<Highlighting />
));
