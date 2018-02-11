import React from 'react';
import { storiesOf } from '@storybook/react';
import { Editor } from 'index';
import FormattingMenu from 'addons/FormattingMenu/FormattingMenu';
import Collaborative from 'addons/Collaborative/Collaborative';
import Image from 'addons/Image/Image';
import Video from 'addons/Video/Video';
import File from 'addons/File/File';
import Latex from 'addons/Latex/Latex';
import Footnote from 'addons/Footnote/Footnote';
import Citation from 'addons/Citation/Citation';
import Iframe from 'addons/Iframe/Iframe';
import InsertMenu from 'addons/InsertMenu/InsertMenu';
import { editorWrapperStyle, s3Upload, firebaseConfig, clientData, renderLatexString, formatCitationString } from './_utilities';

storiesOf('Collaborative', module)
.add('default', () => (
	<div style={editorWrapperStyle}>
		<Editor>
			<FormattingMenu />
			<InsertMenu />
			<Image handleFileUpload={s3Upload} />
			<Video handleFileUpload={s3Upload} />
			<File handleFileUpload={s3Upload} />
			<Iframe />
			<Latex renderFunction={renderLatexString} />
			<Footnote />
			<Citation formatFunction={formatCitationString} />
			<Collaborative
				firebaseConfig={firebaseConfig}
				clientData={clientData}
				// onClientChange={(val)=> { console.log(val); }}
				// onStatusChange={(val)=> { console.log(val); }}
				// editorKey={'sotrybook-editor-v18'}
				editorKey={'pub-fa4a6e01-8d09-4eec-875a-a73c145d22d1'}
			/>
		</Editor>
	</div>
));
