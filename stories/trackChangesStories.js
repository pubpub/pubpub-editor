import React from 'react';
import { storiesOf } from '@storybook/react';
import { Editor } from 'index';
import FormattingMenu from 'addons/FormattingMenu/FormattingMenu';
import TrackChanges from 'addons/TrackChanges/TrackChangesAddon';
import Latex from 'addons/Latex/Latex';
import Image from 'addons/Image/Image';
import InsertMenu from 'addons/InsertMenu/InsertMenu';
import { editorWrapperStyle, s3Upload, renderLatex } from './_utilities';
import initialContent from './initialDocs/imageDoc';

storiesOf('TrackChanges', module)
.add('default', () => (
	<div style={editorWrapperStyle}>
		<Editor
			initialContent={initialContent}
		>
			<FormattingMenu />
			<InsertMenu />
			<TrackChanges />
			<Latex renderFunction={renderLatex} />
			<Image handleFileUpload={s3Upload} />
		</Editor>
	</div>
));
