import React from 'react';
import { storiesOf } from '@storybook/react';
import Editor from '../src2/index';
import { editorWrapperStyle } from './_utilities';
import initialContent from './initialDocs/imageDoc';

// let thing = false;

storiesOf('Editor2', module)
.add('default', () => (
	<div style={editorWrapperStyle}>
		<Editor
			placeholder="Begin writing..."
			initialContent={initialContent}
			onChange={(changeObject)=> {
				// console.log('====');
				console.log(changeObject);
				if (changeObject.updateNode && changeObject.selectedNode.attrs.size === 50) {
					changeObject.updateNode({ size: 65 });
				}

				// if (thing === false) {
				// 	thing = true;
				// 	changeObject.insertFunctions.image({ url: 'https://www.cesarsway.com/sites/newcesarsway/files/styles/large_article_preview/public/All-about-puppies--Cesar%E2%80%99s-tips%2C-tricks-and-advice.jpg?itok=bi9xUvwe' });
				// }
			}}
			getHighlights={()=> {
				return [
					{
						exact: 'Introduction',
						from: '25',
						id: 'abcdefg',
						permanent: false,
						// prefix: 'Hello ',
						// suffix: ' and',
						to: '30',
						version: undefined,
					}
				];
			}}
		/>
	</div>
));
