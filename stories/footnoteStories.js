import React from 'react';
import { storiesOf } from '@storybook/react';
import { Editor } from 'index';
import FormattingMenu from 'addons/FormattingMenu/FormattingMenu';
import Footnote from 'addons/Footnote/Footnote';
import InsertMenu from 'addons/InsertMenu/InsertMenu';
import { editorWrapperStyle } from './_utilities';
import initialContent from './initialDocs/footnoteDoc';

storiesOf('Footnote', module)
.add('default', () => (
	<div style={editorWrapperStyle}>
		<Editor
			initialContent={initialContent}
		>
			<FormattingMenu />
			<InsertMenu />
			<Footnote />
		</Editor>
	</div>
));
