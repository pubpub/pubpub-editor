import React from 'react';
import { storiesOf } from '@storybook/react';
import { Editor } from 'index';
import FormattingMenu from 'addons/FormattingMenu/FormattingMenu';
import Image from 'addons/Image/ImageAddon';
import Latex from 'addons/Latex/LatexAddon';
import InsertMenu from 'addons/InsertMenu/InsertMenu';
import { editorWrapperStyle, s3Upload, renderLatex } from './_utilities';
import initialContent from './initialDocs/imageDoc';

storiesOf('Image', module)
.add('default', () => (
	<div style={editorWrapperStyle}>
		<Editor
			initialContent={initialContent}
			placeholder={'Begin writing here...'}
		>
			<FormattingMenu />
			<InsertMenu />
			<Latex renderFunction={renderLatex} />
			<Image handleFileUpload={s3Upload} />
		</Editor>
	</div>
));
