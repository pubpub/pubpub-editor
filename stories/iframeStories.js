import React from 'react';
import { storiesOf } from '@storybook/react';
import { Editor } from 'index';
import FormattingMenu from 'addons/FormattingMenu/FormattingMenu';
import Iframe from 'addons/Iframe/IframeAddon';
import Latex from 'addons/Latex/LatexAddon';
import InsertMenu from 'addons/InsertMenu/InsertMenu';
import { editorWrapperStyle, renderLatex } from './_utilities';
import initialContent from './initialDocs/iframeDoc';

storiesOf('Iframe', module)
.add('default', () => (
	<div style={editorWrapperStyle}>
		<Editor
			initialContent={initialContent}
			placeholder={'Begin writing here...'}
		>
			<FormattingMenu />
			<InsertMenu />
			<Latex renderFunction={renderLatex} />
			<Iframe />
		</Editor>
	</div>
));
