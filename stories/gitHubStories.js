import React from 'react';
import { storiesOf } from '@storybook/react';
import { Editor } from 'index';
import FormattingMenu from 'addons/FormattingMenu/FormattingMenu';
import GitHub from 'addons/GitHub/GitHub';
import Latex from 'addons/Latex/Latex';
import InsertMenu from 'addons/InsertMenu/InsertMenu';
import { editorWrapperStyle, s3Upload, renderLatex } from './_utilities';
import initialContent from './initialDocs/gitHubDoc';

storiesOf('GitHub', module)
.add('default', () => (
	<div style={editorWrapperStyle}>
		<Editor
			initialContent={initialContent}
			placeholder="Begin writing here..."
		>
			<FormattingMenu />
			<InsertMenu />
			<Latex renderFunction={renderLatex} />
			<GitHub />
		</Editor>
	</div>
));
