import React from 'react';
import { storiesOf } from '@storybook/react';
import { Editor } from 'index';
import FormattingMenu from 'addons/FormattingMenu/FormattingMenu';
import File from 'addons/File/FileAddon';
import Latex from 'addons/Latex/LatexAddon';
import InsertMenu from 'addons/InsertMenu/InsertMenu';
import { editorWrapperStyle, s3Upload, renderLatex } from './_utilities';
import initialContent from './initialDocs/fileDoc';

storiesOf('File', module)
.add('default', () => (
	<div style={editorWrapperStyle}>
		<Editor
			initialContent={initialContent}
			placeholder={'Begin writing here...'}
		>
			<FormattingMenu />
			<InsertMenu />
			<Latex renderFunction={renderLatex} />
			<File handleFileUpload={s3Upload} />
		</Editor>
	</div>
));
