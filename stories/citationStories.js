import React from 'react';
import { storiesOf } from '@storybook/react';
import { Editor } from 'index';
import FormattingMenu from 'addons/FormattingMenu/FormattingMenu';
import Citation from 'addons/Citation/CitationAddon';
import InsertMenu from 'addons/InsertMenu/InsertMenu';
import { editorWrapperStyle } from './_utilities';
import initialContent from './initialDocs/citationDoc';

storiesOf('Citation', module)
.add('default', () => (
	<div style={editorWrapperStyle}>
		<Editor
			initialContent={initialContent}
		>
			<FormattingMenu />
			<InsertMenu />
			<Citation
				formatFunction={(val, callback)=> {
					setTimeout(()=> {
						callback(`html: ${val}`);
					}, 500);
				}}
			/>
		</Editor>
	</div>
));
