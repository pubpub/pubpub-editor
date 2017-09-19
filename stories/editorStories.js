/* eslint-disable */
import React from 'react';
import { storiesOf } from '@storybook/react';
import { Editor } from 'index';
import FormattingMenu from 'addons/FormattingMenu/FormattingMenu';
import Latex from '../addons/Latex';

const onChange = (evt)=> {
	console.log(evt);
};

storiesOf('Editor', module)
.add('Default', () => (
	<div>
		<Editor onChange={onChange}>
			<FormattingMenu />
			<Latex />
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

		</Editor>
	</div>
));
