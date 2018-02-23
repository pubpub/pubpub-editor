import React from 'react';
import { storiesOf } from '@storybook/react';
import { Editor } from 'index';
import FormattingMenu from 'addons/FormattingMenu/FormattingMenu';
import Collaborative from 'addons/CollaborativeNew/Collaborative';
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
		<Editor editorId={'editor'} placeholder="type here">
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
				editorKey={'storybook-editor-v22'}
			/>
		</Editor>
	</div>
));
