import React from 'react';
import { storiesOf } from '@storybook/react';
import { Editor } from 'index';
import Table from 'addons/Table/Table';
import { editorWrapperStyle } from './_utilities';
import initialContent from './initialDocs/tableDoc';

storiesOf('Table', module)
.add('default', () => (
	<div style={editorWrapperStyle}>
		<Editor
			initialContent={initialContent}
			placeholder="Begin writing here..."
		>
			<Table />
		</Editor>
	</div>
));
