import React from 'react';
import { storiesOf } from '@storybook/react';
import { Editor } from 'index';
import FormattingMenu from 'addons/FormattingMenu/FormattingMenu';
import Collaborative from 'addons/Collaborative/Collaborative';
import TrackChanges from 'addons/TrackChanges/TrackChangesAddon';
import Latex from 'addons/Latex/LatexAddon';
import Image from 'addons/Image/ImageAddon';
import InsertMenu from 'addons/InsertMenu/InsertMenu';
import { editorWrapperStyle, s3Upload, renderLatex, firebaseConfig, clientData } from './_utilities';

storiesOf('TrackChangesCollaborative', module)
.add('default', () => (
	<div style={editorWrapperStyle}>
		<Editor>
			<FormattingMenu />
			<InsertMenu />
			<TrackChanges />
			<Latex renderFunction={renderLatex} />
			<Image handleFileUpload={s3Upload} />
			<Collaborative
				firebaseConfig={firebaseConfig}
				clientData={clientData}
				editorKey={'storybook-track-collab-v2'}
			/>
		</Editor>
	</div>
));
