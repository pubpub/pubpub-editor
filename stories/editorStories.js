import React from 'react';
import { storiesOf } from '@storybook/react';
import { Editor } from 'index';
import FormattingMenu from 'addons/FormattingMenu/FormattingMenu';
import HeaderMenu from 'addons/HeaderMenu/HeaderMenu';
import LinkMenu from 'addons/LinkMenu/LinkMenu';
import Image from 'addons/Image/Image';
import Latex from 'addons/Latex/Latex';
import { editorWrapperStyle, s3Upload, renderLatex } from './_utilities';

storiesOf('Editor', module)
.add('default', () => (
	<div style={editorWrapperStyle}>
		<Editor placeholder="Begin writing..." />
	</div>
))
.add('Formatting Menu', () => (
	<div style={editorWrapperStyle}>
		<Editor placeholder="Begin writing...">
			<FormattingMenu />
		</Editor>
	</div>
))
.add('Header Menu', () => (
	<div style={editorWrapperStyle}>
		<Editor placeholder="Begin writing...">
			<HeaderMenu />
			<Latex renderFunction={renderLatex} />
			<Image handleFileUpload={s3Upload} />
			<LinkMenu />
		</Editor>
	</div>
))
.add('Multiple Editors', () => (
	<div>
		<div className="editor-1" style={editorWrapperStyle}>
			<Editor placeholder="Begin writing...">
				<FormattingMenu />
				<Latex renderFunction={renderLatex} />
			</Editor>
		</div>
		<div className="editor-2" style={editorWrapperStyle}>
			<Editor placeholder="Begin writing...">
				<FormattingMenu />
				<Latex renderFunction={renderLatex} />
			</Editor>
		</div>
	</div>
))
.add('Reduced Formatting Menu', () => (
	<div style={editorWrapperStyle}>
		<Editor placeholder="Begin writing...">
			<FormattingMenu include={['link', 'bold', 'italic']} />
		</Editor>
	</div>
));
