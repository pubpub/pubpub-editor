import { equationDoc, imageDoc } from './data';

import Collaborative from 'addons/Collaborative/Collaborative';
import { Editor } from 'index';
import FormattingMenu from 'addons/FormattingMenu/FormattingMenu';
import Image from 'addons/Image/ImageAddon';
import InsertMenu from 'addons/InsertMenu/InsertMenu';
import Latex from 'addons/Latex/LatexAddon';
/* eslint-disable */
import React from 'react';
import TrackChanges from 'addons/TrackChanges/TrackChangesAddon';
import { storiesOf } from '@storybook/react';
import uploadFile from './utils/uploadFile';

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

{/*
	<FormattingMenu />
	<InsertMenu />
	<Collaborative />
	<Rebase />

	<Latex />
	<Footnotes />
	<Iframe />
	<Image />
	<Video />
	<Audio />
	<Discussion />
	<Reference />
	<ReferenceList />
	<UserMention />
	<File />
*/}

storiesOf('Editor', module)
.add('Default', () => (
	<div style={editorWrapper} onClick={focusEditor}>
		<Editor onChange={onChange} ref={(ref)=> { editorRef = ref; }} placeholder={'Begin writing...'}>
			<FormattingMenu />
		</Editor>
	</div>
))
.add('Latex', () => (
	<Editor onChange={onChange} initialContent={equationDoc}>
		<FormattingMenu />
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
		<Editor onChange={onChange} initialContent={imageDoc}>
			<FormattingMenu />
			<InsertMenu />
			<Latex />
			<Image handleFileUpload={uploadFile}/>
		</Editor>
	</div>
))
.add('Track Changes', () => (
	<div style={{width: "80%", margin: "0 auto"}}>
		<Editor onChange={onChange} initialContent={imageDoc}>
			<FormattingMenu />
			<InsertMenu />
			<TrackChanges />
			<Latex />
			<Image handleFileUpload={uploadFile}/>
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
			<Image handleFileUpload={uploadFile}/>
			<Collaborative
				// ref={(collab) => { this.collab = collab; }}
				firebaseConfig={firebaseConfig}
				clientData={{
					id: 'storybook-clientid',
					name: 'Anon User',
					backgroundColor: 'rgba(0, 0, 250, 0.2)',
					cursorColor: 'rgba(0, 0, 250, 0.8)',
				}}
				editorKey={'storybook-track-collab-v1'}
			/>
		</Editor>
	</div>
))
.add('Collaborative', () => (
	<div style={{width: "80%", margin: "0 auto"}}>
		<Editor>
			<FormattingMenu />
			<InsertMenu />
			<Image handleFileUpload={uploadFile}/>
			<Collaborative
				// ref={(collab) => { this.collab = collab; }}
				firebaseConfig={firebaseConfig}
				onClientChange={(clients) => { }}
				clientData={{
					id: 'storybook-clientid',
					name: 'Anon User',
					backgroundColor: 'rgba(0, 0, 250, 0.2)',
					cursorColor: 'rgba(0, 0, 250, 0.8)',
				}}
				onClientChange={onClientChange}
				editorKey={'storybook-editorkey-v13'}
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
