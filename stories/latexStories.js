import React from 'react';
import { storiesOf } from '@storybook/react';
import { Editor } from 'index';
import FormattingMenu from 'addons/FormattingMenu/FormattingMenu';
import InsertMenu from 'addons/InsertMenu/InsertMenu';
import Latex from 'addons/Latex/LatexAddon';
import { editorWrapperStyle, renderLatex } from './_utilities';
import initialContent from './initialDocs/latexDoc';

storiesOf('Latex', module)
.add('default', () => (
	<div style={editorWrapperStyle}>
		<Editor initialContent={initialContent}>
			<FormattingMenu />
			<InsertMenu />
			<Latex renderFunction={renderLatex} />
		</Editor>
	</div>
));
