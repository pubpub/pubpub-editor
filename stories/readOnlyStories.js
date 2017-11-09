import React from 'react';
import { storiesOf } from '@storybook/react';
import { Editor } from 'index';
import FormattingMenu from 'addons/FormattingMenu/FormattingMenu';
import Image from 'addons/Image/ImageAddon';
import Latex from 'addons/Latex/LatexAddon';
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
