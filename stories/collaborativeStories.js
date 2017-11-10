import React from 'react';
import { storiesOf } from '@storybook/react';
import { Editor } from 'index';
import FormattingMenu from 'addons/FormattingMenu/FormattingMenu';
import Collaborative from 'addons/Collaborative/Collaborative';
import Image from 'addons/Image/Image';
import InsertMenu from 'addons/InsertMenu/InsertMenu';
import { editorWrapperStyle, s3Upload, firebaseConfig, clientData } from './_utilities';

storiesOf('Collaborative', module)
.add('default', () => (
	<div style={editorWrapperStyle}>
		<Editor>
			<FormattingMenu />
			<InsertMenu />
			<Image handleFileUpload={s3Upload} />
			<Collaborative
				firebaseConfig={firebaseConfig}
				clientData={clientData}
				// onClientChange={(val)=> { console.log(val); }}
				editorKey={'storybook-editorkey-v15'}
			/>
		</Editor>
	</div>
));
