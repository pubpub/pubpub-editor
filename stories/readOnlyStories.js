import React from 'react';
import { storiesOf } from '@storybook/react';
import { Editor } from 'index';
import FormattingMenu from 'addons/FormattingMenu/FormattingMenu';
import Image from 'addons/Image/Image';
import Latex from 'addons/Latex/Latex';
import { editorWrapperStyle, renderLatex } from './_utilities';
import initialContent from './initialDocs/imageDoc';

storiesOf('ReadOnly', module)
.add('default', () => (
	<div style={editorWrapperStyle}>
		<Editor
			isReadOnly={true}
			initialContent={initialContent}
		>
			<FormattingMenu />
			<Image />
			<Latex renderFunction={renderLatex} />
		</Editor>
	</div>
));
