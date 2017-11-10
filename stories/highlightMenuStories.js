import React from 'react';
import { storiesOf } from '@storybook/react';
import { Editor } from 'index';
import HighlightMenu from 'addons/HighlightMenu/HighlightMenu';
import Image from 'addons/Image/Image';
import InsertMenu from 'addons/InsertMenu/InsertMenu';
import Latex from 'addons/Latex/Latex';
import { editorWrapperStyle, s3Upload, renderLatex } from './_utilities';
import plainDoc from './initialDocs/plainDoc';

storiesOf('HighlightMenu', module)
.add('default', () => (
	<div style={editorWrapperStyle} className={'selection-cite-wrapper'}>
		<Editor
			placeholder={'Begin writing...'}
			initialContent={plainDoc}
		>
			<HighlightMenu
				highlights={[
					{
						from: 126,
						to: 145,
						id: 'asdh71j',
						exact: 'Hello, this is some',
						prefix: ' though.',
						suffix: ' text abou'
					},
					{
						from: 257,
						to: 274,
						id: 'asd81k9l',
						exact: 'things talk about',
						prefix: 'h.Other ',
						suffix: ' earthworm'
					},
					{
						from: 26,
						to: 45,
						id: 'nausd52',
						exact: 'about a thing that ',
						prefix: 'some text ',
						suffix: 'we are typ'
					}
				]}
				primaryEditorClassName={'selection-cite-wrapper'}
				onNewDiscussion={(data)=>{
					console.log('New discussion', data);
				}}
				onDotClick={(thing)=> {
					console.log('Clicked selection ', thing);
				}}
				// versionId={'1233-asd3-as23-asf3'}
			/>
			<InsertMenu />
			<Latex renderFunction={renderLatex} />
			<Image handleFileUpload={s3Upload} />
		</Editor>
	</div>
));
