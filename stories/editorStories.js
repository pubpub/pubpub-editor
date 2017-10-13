/* eslint-disable */
import React, { Component } from 'react';
import { equationDoc, imageDoc, videoDoc, iframeDoc, fileDoc, footnoteDoc } from './data';

import Collaborative from 'addons/Collaborative/Collaborative';
import { Editor } from 'index';
import FormattingMenu from 'addons/FormattingMenu/FormattingMenu';
import Image from 'addons/Image/ImageAddon';
import Video from 'addons/Video/VideoAddon';
import Iframe from 'addons/Iframe/IframeAddon';
import File from 'addons/File/FileAddon';
import Footnote from 'addons/Footnote/FootnoteAddon';
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

storiesOf('Editor', module)
.add('Default', () => (
	// <div style={editorWrapper} onClick={focusEditor}>
	<div style={editorWrapper}>
		<style>{`
			.pubpub-editor { font-family: serif; }	
		`}</style>
		<Editor onChange={onChange} ref={(ref)=> { editorRef = ref; }} placeholder={'Begin writing...'}>
			<FormattingMenu />
		</Editor>
	</div>
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
