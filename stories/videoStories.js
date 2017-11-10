import React from 'react';
import { storiesOf } from '@storybook/react';
import { Editor } from 'index';
import FormattingMenu from 'addons/FormattingMenu/FormattingMenu';
import Video from 'addons/Video/Video';
import Latex from 'addons/Latex/Latex';
import InsertMenu from 'addons/InsertMenu/InsertMenu';
import { editorWrapperStyle, s3Upload, renderLatex } from './_utilities';
import initialContent from './initialDocs/videoDoc';

storiesOf('Video', module)
.add('default', () => (
	<div style={editorWrapperStyle}>
		<Editor
			initialContent={initialContent}
			placeholder={'Begin writing here...'}
		>
			<FormattingMenu />
			<InsertMenu />
			<Latex renderFunction={renderLatex} />
			<Video handleFileUpload={s3Upload} />
		</Editor>
	</div>
));
