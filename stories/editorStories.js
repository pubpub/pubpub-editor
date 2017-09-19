/* eslint-disable */
import React from 'react';
import { storiesOf } from '@storybook/react';
import { Editor } from 'index';
import FormattingMenu from 'addons/FormattingMenu/FormattingMenu';
import Collaborative from 'addons/Collaborative/Collaborative';
import Latex from 'addons/Latex/LatexAddon';

const editorWrapper = {
	border: '1px solid #CCC',
	maxWidth: '600px',
	minHeight: '250px',
};
let editorRef = undefined;

const focusEditor = ()=> {
	editorRef.focus();
};

const onChange = (evt)=> {
	console.log(evt);
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

const equationDoc = {
	type: 'doc',
	attrs: {
		'meta': {}
	},
	content: [
		{
			type: 'paragraph',
			content: [
				{
					type: 'equation',
					attrs: {
					  content: '\\sum_ix^i'
					}
				},
				{
					type: 'text',
					text: ' and hello.'
				}
			]
		}
	]
};
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
.add('Collaborative', () => (
	<Editor onChange={onChange}>
		<FormattingMenu />
		<Collaborative 
			// ref={(collab) => { this.collab = collab; }}
			firebaseConfig={{
				apiKey: 'AIzaSyBpE1sz_-JqtcIm2P4bw4aoMEzwGITfk0U',
				authDomain: 'pubpub-rich.firebaseapp.com',
				databaseURL: 'https://pubpub-rich.firebaseio.com',
				projectId: 'pubpub-rich',
				storageBucket: 'pubpub-rich.appspot.com',
				messagingSenderId: '543714905893',
			}}
			clientID={`storybook-clientid-${Math.ceil(Math.random() * 25000)}`}
			editorKey={'storybook-editorkey'}
		/>
	</Editor>
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
