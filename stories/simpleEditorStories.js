import React from 'react';
import { storiesOf } from '@storybook/react';
import { SimpleEditor } from 'index';
import { editorWrapperStyle } from './_utilities';

storiesOf('SimpleEditor', module)
.add('default', () => (
	<div style={editorWrapperStyle}>
		<SimpleEditor placeholder="Begin writing..." />
	</div>
));
