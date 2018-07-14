import React from 'react';
import { storiesOf } from '@storybook/react';
import { Editor } from 'index';
import HighlightMenu from 'addons/HighlightMenu/HighlightMenu';
import Image from 'addons/Image/Image';
import InsertMenu from 'addons/InsertMenu/InsertMenu';
import Latex from 'addons/Latex/Latex';
import { editorWrapperStyle, s3Upload, renderLatex } from './_utilities';
import longDoc from './initialDocs/longDoc';

storiesOf('HighlightMenu', module)
.add('default', () => (
	<div style={editorWrapperStyle} className={'selection-cite-wrapper'}>
		<Editor
			placeholder={'Begin writing...'}
			initialContent={longDoc}
		>
			<HighlightMenu
				highlights={[
					{
						from: 126,
						to: 145,
						id: 'asdh71j',
						exact: ' the truth of the ',
						prefix: ' endeavoured to preserve.',
						suffix: ' elementary principles'
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
						exact: 'largely on the basis of circumstantial evidence. ',
						prefix: 'in a murder trial ',
						suffix: 'She was found in '
					},
					{
						from: 3000,
						to: 3008,
						id: 'dddsd52',
						exact: ' any thi',
						prefix: 'in a murder trial ',
						suffix: 'She was found in '
					}
				]}
				primaryEditorClassName={'selection-cite-wrapper'}
				onNewDiscussion={(data)=>{
					console.log('New discussion', data);
				}}
				onDotClick={(thing, targetNode)=> {
					console.log('Clicked selection ', thing, targetNode);
				}}
				// versionId={'1233-asd3-as23-asf3'}
			/>
			<InsertMenu />
			<Latex renderFunction={renderLatex} />
			<Image handleFileUpload={s3Upload} />
		</Editor>
	</div>
));
