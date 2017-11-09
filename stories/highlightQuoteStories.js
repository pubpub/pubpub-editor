import React from 'react';
import { storiesOf } from '@storybook/react';
import { Editor } from 'index';
import HighlightQuote from 'addons/HighlightQuote/HighlightQuoteAddon';
import Image from 'addons/Image/ImageAddon';
import InsertMenu from 'addons/InsertMenu/InsertMenu';
import Latex from 'addons/Latex/LatexAddon';
import { editorWrapperStyle, s3Upload, renderLatex } from './_utilities';
import initialContent from './initialDocs/highlightQuoteDoc';

storiesOf('HighlightQuote', module)
.add('default', () => (
	<div style={editorWrapperStyle}>
		<Editor
			placeholder={'Begin writing...'}
			initialContent={initialContent}
		>
			<HighlightQuote />
			<InsertMenu />
			<Latex renderFunction={renderLatex} />
			<Image handleFileUpload={s3Upload} />
		</Editor>
	</div>
));
