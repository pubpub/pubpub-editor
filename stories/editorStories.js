/* eslint-disable */
import React, { Component } from 'react';
import { plainDoc, highlightDoc, equationDoc, imageDoc, videoDoc, iframeDoc, fileDoc, footnoteDoc, citationDoc } from './data';
import Collaborative from 'addons/Collaborative/Collaborative';
import { Editor } from 'index';
import FormattingMenu from 'addons/FormattingMenu/FormattingMenu';
import HighlightMenu from 'addons/HighlightMenu/HighlightMenu';
import HighlightQuote from 'addons/HighlightQuote/HighlightQuoteAddon';
import Image from 'addons/Image/ImageAddon';
import Video from 'addons/Video/VideoAddon';
import Iframe from 'addons/Iframe/IframeAddon';
import File from 'addons/File/FileAddon';
import Footnote from 'addons/Footnote/FootnoteAddon';
import Citation from 'addons/Citation/CitationAddon';
import InsertMenu from 'addons/InsertMenu/InsertMenu';
import Latex from 'addons/Latex/LatexAddon';
import TrackChanges from 'addons/TrackChanges/TrackChangesAddon';
import { storiesOf } from '@storybook/react';
import { s3Upload } from './utils/uploadFile';

require('@blueprintjs/core/dist/blueprint.css');


const firebaseConfig = {
	apiKey: 'AIzaSyBpE1sz_-JqtcIm2P4bw4aoMEzwGITfk0U',
	authDomain: 'pubpub-rich.firebaseapp.com',
	databaseURL: 'https://pubpub-rich.firebaseio.com',
	projectId: 'pubpub-rich',
	storageBucket: 'pubpub-rich.appspot.com',
	messagingSenderId: '543714905893',
};

const editorWrapper = {
	border: '1px solid #CCC',
	maxWidth: '600px',
	minHeight: '250px',
	cursor: 'text',
	padding: '20px',
};
let editorRef = undefined;

const focusEditor = ()=> {
	editorRef.focus();
};

const onChange = (evt)=> {
	// console.log(evt);
};
const onClientChange = (evt)=> {
	console.log('Clients', evt);
};


class ForkStory extends Component {

	constructor(props) {
		super(props);
		this.state = {
			rootKey: 'storybook-track-fork-v3',
			editorKey: 'storybook-track-fork-v3',
			inFork: false,
			forks: [],
		};
	}

	fork = () => {
		const { inFork } = this.state;
		if (!inFork) {
			this.collab.fork().then((forkName) => {
				this.setState({editorKey: forkName, inFork: true});
			})
		} else {
			this.setState({ editorKey: this.state.rootKey, inFork: false });
		}

	}

	updateForks = (forks) => {
		this.setState({ forks });
	}

	joinFork = (fork) => {
		this.setState({ editorKey: fork.name, inFork: true });
	}

	render() {
		const { editorKey, inFork, forks } = this.state;

		return (<div style={{width: "80%", margin: "0 auto"}}>
				<button onClick={this.fork}>{(!inFork)? 'Fork' : 'Back' }</button>
				{forks.map((fork) => {
					return (<button onClick={this.joinFork.bind(this, fork)}>{fork.name}</button>)
				})}

				<Editor key={editorKey}>
					<FormattingMenu />
					<InsertMenu />
					{(inFork) ? <TrackChanges /> : null }
					<Latex />
					<Image handleFileUpload={s3Upload}/>
					<Collaborative
						ref={(collab) => { this.collab = collab; }}
						onForksUpdate={this.updateForks}
						firebaseConfig={firebaseConfig}
						clientData={{
							id: 'storybook-clientid',
							name: 'Anon User',
							backgroundColor: 'rgba(0, 0, 250, 0.2)',
							cursorColor: 'rgba(0, 0, 250, 0.8)',
						}}
						editorKey={editorKey}
					/>
				</Editor>
			</div>);
	}
}

class Highlighting extends Component {

	constructor(props) {
		super(props);
		// this.state = {
		// 	primaryEditorState: undefined
		// };
		this.editor = undefined;
	}

	// setRef = (ref)=> {
	// 	console.log(ref)
	// 	const thing = ref;
	// 	debugger;
		
	// 	this.editorRef = ref;
	// }
	// onChange = (thing)=> {
	// 	console.log(this.editor.state.editorState);
	// 	if (!this.state.primaryEditorState) {
	// 		this.setState({ primaryEditorState: this.editor.state.editorState });
	// 	}
	// }
	getHighlightContent = (from, to)=> {
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
				<div style={editorWrapper} className={'selection-cite-wrapper'}>
					<style>{`
						.pubpub-editor { font-family: serif; }	
					`}</style>
					<Editor onChange={this.onChange} ref={(ref)=> { this.editor = ref; }} placeholder={'Begin writing...'} initialContent={plainDoc}>
						<HighlightMenu
							highlights={[
								// {
								// 	exact: 'is a new',
								// 	prefix: 'hello this',
								// 	suffix: 'sentence.',
								// 	id: 'h75gbre4',
								// }
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
								// {
								// 	exact: "t we are typing. We have lots",
								// 	from: 168,
								// 	hash: undefined,
								// 	id: "fakei3d",
								// 	prefix: " thing tha",
								// 	suffix: " of words ",
								// 	to: 197,
								// 	version: undefined,
								// }
							]}
							primaryEditorClassName={'selection-cite-wrapper'}
							onNewDiscussion={(data)=>{ console.log('New discussion', data); }}
							onSelectionClick={(thing)=> { console.log('Clicked selection ', thing); }}
							// versionId={'1233-asd3-as23-asf3'}
						/>
						<InsertMenu />
						<Latex />
						<Image handleFileUpload={s3Upload}/>
					</Editor>
				</div>
				<div style={editorWrapper}>
					<style>{`
						.pubpub-editor { font-family: serif; }	
					`}</style>
					<Editor onChange={onChange} placeholder={'Begin writing...'} initialContent={highlightDoc}>
						<HighlightQuote
							getHighlightContent={this.getHighlightContent}
							hoverBackgroundColor={'red'}
						/>
						<InsertMenu />
						<Latex />
						<Image handleFileUpload={s3Upload}/>
					</Editor>
				</div>


			</div>
		);
	}
}
// https://localhost:9002/iframe.html/pub/huh?from=382&to=405&hash=2805056428
storiesOf('Editor', module)
.add('Default', () => (
	// <div style={editorWrapper} onClick={focusEditor}>
	<div>
		<div style={editorWrapper}>
			<style>{`
				.pubpub-editor { font-family: serif; }	
			`}</style>
			<Editor onChange={onChange} ref={(ref)=> { editorRef = ref; }} placeholder={'Begin writing...'}>
				<FormattingMenu />
			</Editor>
		</div>

		<div style={editorWrapper}>
			<style>{`
				.pubpub-editor { font-family: serif; }	
			`}</style>
			<Editor onChange={onChange} ref={(ref)=> { editorRef = ref; }} placeholder={'Begin writing...'}>
				<FormattingMenu include={['link', 'bold', 'italic']}/>
			</Editor>
		</div>
	</div>
	
))
.add('HighlightMenu', () => (
	<div>
		<div style={editorWrapper} className={'selection-cite-wrapper'}>
			<style>{`
				.pubpub-editor { font-family: serif; }	
			`}</style>
			<Editor onChange={onChange} ref={(ref)=> { console.log(ref); editorRef = ref; }} placeholder={'Begin writing...'} initialContent={plainDoc}>
				<HighlightMenu
					highlights={[
						// {
						// 	exact: 'is a new',
						// 	prefix: 'hello this',
						// 	suffix: 'sentence.',
						// 	id: 'h75gbre4',
						// }
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
						},
						// {
						// 	exact: "t we are typing. We have lots",
						// 	from: 168,
						// 	hash: undefined,
						// 	id: "fakei3d",
						// 	prefix: " thing tha",
						// 	suffix: " of words ",
						// 	to: 197,
						// 	version: undefined,
						// }
					]}
					primaryEditorClassName={'selection-cite-wrapper'}
					onNewDiscussion={(data)=>{ console.log('New discussion', data); }}
					onSelectionClick={(thing)=> { console.log('Clicked selection ', thing); }}
					// versionId={'1233-asd3-as23-asf3'}
				/>
				<InsertMenu />
				<Latex />
				<Image handleFileUpload={s3Upload}/>
			</Editor>
		</div>
	</div>
	
))
.add('HighlightQuote', () => (
	<div>
		<div style={editorWrapper}>
			<style>{`
				.pubpub-editor { font-family: serif; }	
			`}</style>
			<Editor onChange={onChange} ref={(ref)=> { editorRef = ref; }} placeholder={'Begin writing...'} initialContent={highlightDoc}>
				<HighlightQuote />
				<InsertMenu />
				<Latex />
				<Image handleFileUpload={s3Upload}/>
			</Editor>
		</div>
	</div>
))
.add('Highlighting', () => (
	<Highlighting />
))
.add('Latex', () => (
	<Editor onChange={onChange} initialContent={equationDoc}>
		<FormattingMenu />
		<InsertMenu />
		<Latex />
	</Editor>
))
.add('ReadOnly', () => (
	<Editor isReadOnly={true} initialContent={imageDoc}>
		<FormattingMenu />
		<Image />
		<Latex />
	</Editor>
))
.add('Images', () => (
	<div style={{width: "80%", margin: "0 auto"}}>
		<Editor onChange={onChange} initialContent={imageDoc} placeholder={'Begin writing here...'}>
			<FormattingMenu />
			<InsertMenu />
			<Latex />
			<Image handleFileUpload={s3Upload}/>
		</Editor>
	</div>
))
.add('Videos', () => (
	<div style={{width: "80%", margin: "0 auto"}}>
		<Editor onChange={onChange} initialContent={videoDoc} placeholder={'Begin writing here...'}>
			<FormattingMenu />
			<InsertMenu />
			<Latex />
			<Video handleFileUpload={s3Upload}/>
		</Editor>
	</div>
))
.add('Iframes', () => (
	<div style={{width: "80%", margin: "0 auto"}}>
		<Editor onChange={onChange} initialContent={iframeDoc} placeholder={'Begin writing here...'}>
			<FormattingMenu />
			<InsertMenu />
			<Latex />
			<Iframe />
		</Editor>
	</div>
))
.add('Files', () => (
	<div style={{width: "80%", margin: "0 auto"}}>
		<Editor onChange={onChange} initialContent={fileDoc} placeholder={'Begin writing here...'}>
			<FormattingMenu />
			<InsertMenu />
			<Latex />
			<File handleFileUpload={s3Upload}/>
		</Editor>
	</div>
))
.add('Footnote', () => (
	<Editor onChange={onChange} initialContent={footnoteDoc}>
		<FormattingMenu />
		<InsertMenu />
		<Footnote />
	</Editor>
))
.add('Citation', () => (
	<Editor onChange={onChange} initialContent={citationDoc}>
		<FormattingMenu />
		<InsertMenu />
		<Citation formatFunction={(val, callback)=> {
			setTimeout(()=> {
				callback(`html: ${val}`);
			}, 500);
		}}/>
	</Editor>
))
.add('Track Changes', () => (
	<div style={{width: "80%", margin: "0 auto"}}>
		<Editor onChange={onChange} initialContent={imageDoc}>
			<FormattingMenu />
			<InsertMenu />
			<TrackChanges />
			<Latex />
			<Image handleFileUpload={s3Upload}/>
		</Editor>
	</div>
))
.add('Track Changes with Collaborative', () => (
	<div style={{width: "80%", margin: "0 auto"}}>
		<Editor onChange={onChange}>
			<FormattingMenu />
			<InsertMenu />
			<TrackChanges />
			<Latex />
			<Image handleFileUpload={s3Upload}/>
			<Collaborative
				// ref={(collab) => { this.collab = collab; }}
				firebaseConfig={firebaseConfig}
				clientData={{
					id: 'storybook-clientid',
					name: 'Anon User',
					backgroundColor: 'rgba(0, 0, 250, 0.2)',
					cursorColor: 'rgba(0, 0, 250, 1.0)',
					image: 'https://s3.amazonaws.com/uifaces/faces/twitter/rickdt/128.jpg',
					initials: 'DR',
				}}
				editorKey={'storybook-track-collab-v1'}
			/>
		</Editor>
	</div>
))
.add('Fork stories', () => (
	<ForkStory/>
))
.add('Collaborative', () => (
	<div style={{width: "80%", margin: "0 auto"}}>
		<Editor>
			<FormattingMenu />
			<InsertMenu />
			<Image handleFileUpload={s3Upload}/>
			<Footnote />
			<Collaborative
				// ref={(collab) => { this.collab = collab; }}
				firebaseConfig={firebaseConfig}
				onClientChange={(clients) => { }}
				clientData={{
					id: `storybook-clientid-${Math.floor(Math.random() * 2500)}`,
					name: 'Anon User',
					backgroundColor: 'rgba(0, 0, 250, 0.2)',
					cursorColor: 'rgba(0, 0, 250, 1.0)',
					image: 'https://s3.amazonaws.com/uifaces/faces/twitter/rickdt/128.jpg',
					initials: 'DR',
				}}
				onClientChange={onClientChange}
				editorKey={'storybook-editorkey-v15'}
			/>
		</Editor>
	</div>
))
.add('Multiple Editors', () => (
	<div>
		<div className={'1'}>
			<Editor>
				<FormattingMenu />
				<Latex />
			</Editor>
		</div>
		<div className={'2'}>
			<Editor>
				<FormattingMenu />
				<Latex />
			</Editor>
		</div>
	</div>
));


/*
this.rebase.fork(fork).then((forkRef) => {
	this.setState({inFork: true, editorRef: forkRef});
});

this.rebase.getForks(); // => [array of forks];
this.rebase.isFork(); // => if current branch is in a fork
this.rebase.startRebase(forkName);

*/
