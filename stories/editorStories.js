import React from 'react';
import { storiesOf } from '@storybook/react';
import { Editor } from 'index';
import FormattingMenu from 'addons/FormattingMenu/FormattingMenu';
import Latex from 'addons/Latex/Latex';
import { editorWrapperStyle, renderLatex } from './_utilities';

storiesOf('Editor', module)
.add('default', () => (
	<div style={editorWrapperStyle}>
		<Editor
			placeholder={'Begin writing...'}
			initHtml={`<h1>Title</h1><p>And some content.</p>`}
		/>
	</div>
))
.add('Formatting Menu', () => (
	<div style={editorWrapperStyle}>
		<Editor placeholder={'Begin writing...'}>
			<FormattingMenu />
		</Editor>
	</div>
))
.add('Multiple Editors', () => (
	<div>
		<div className={'editor-1'} style={editorWrapperStyle}>
			<Editor placeholder={'Begin writing...'}>
				<FormattingMenu />
				<Latex renderFunction={renderLatex} />
			</Editor>
		</div>
		<div className={'editor-2'} style={editorWrapperStyle}>
			<Editor placeholder={'Begin writing...'}>
				<FormattingMenu />
				<Latex renderFunction={renderLatex} />
			</Editor>
		</div>
	</div>
))
.add('Reduced Formatting Menu', () => (
	<div style={editorWrapperStyle}>
		<Editor placeholder={'Begin writing...'}>
			<FormattingMenu include={['link', 'bold', 'italic']} />
		</Editor>
	</div>
));
