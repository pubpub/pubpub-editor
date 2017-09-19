/* eslint-disable */
import React from 'react';
import { storiesOf } from '@storybook/react';
import { Editor } from 'index';
import FormattingMenu from 'addons/FormattingMenu/FormattingMenu';
import Latex from '../addons/Latex';

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
	<Editor onChange={onChange}>
		<FormattingMenu />
	</Editor>
))
.add('Latex', () => (
	<Editor onChange={onChange} initialContent={equationDoc}>
		<FormattingMenu />
		<Latex />
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
