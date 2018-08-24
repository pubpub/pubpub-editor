import React from 'react';
import { storiesOf } from '@storybook/react';
import Editor from '../src2/index';
import { editorWrapperStyle } from './_utilities';
import initialContent from './initialDocs/imageDoc';

storiesOf('Editor2', module)
.add('default', () => (
	<div style={editorWrapperStyle}>
		<Editor
			placeholder="Begin writing..."
			initialContent={initialContent}
			onChange={(changeObject)=> {
				if (changeObject.updateNode && changeObject.selectedNode.attrs.size === 50) {
					changeObject.updateNode({ size: 65 });
				}
			}}
		/>
	</div>
));
