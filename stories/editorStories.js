/* eslint-disable */
import { Editor } from 'index';
import FormattingMenu from 'addons/FormattingMenu/FormattingMenu';
import Latex from 'addons/Latex/LatexAddon';
import React from 'react';
import { storiesOf } from '@storybook/react';

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


storiesOf('Editor', module)
.add('Multiple Editors', () => (
	<div>
		<Editor>
			<FormattingMenu />
			<Latex />
		</Editor>
		<Editor>
			<FormattingMenu />
			<Latex />
		</Editor>
	</div>
));
