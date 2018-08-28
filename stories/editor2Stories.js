import React from 'react';
import { storiesOf } from '@storybook/react';
import Editor from '../src2/index';
import { editorWrapperStyle, firebaseConfig, clientData } from './_utilities';
import initialContent from './initialDocs/fullDoc';
// import { getCollabJSONs } from '../src2/utilities';
// let thing = false;

storiesOf('Editor2', module)
.add('default', () => (
	<div style={editorWrapperStyle}>
		<Editor
			placeholder="Begin writing..."
			initialContent={initialContent}
			// isReadOnly={true}
			onChange={(changeObject)=> {
				console.log('====');
				// console.log(changeObject.view.state.doc.toJSON(), null, 4));
				console.log(changeObject.menuItems);
				// console.log(getCollabJSONs(changeObject.view));
				if (changeObject.updateNode && changeObject.selectedNode.attrs.size === 50) {
					changeObject.updateNode({ size: 65 });
				}

				if (changeObject.shortcutValues['@'] === 'dog' && changeObject.selection.empty) {
					changeObject.shortcutValues.selectShortCut();
					changeObject.insertFunctions.image({ url: 'https://www.cesarsway.com/sites/newcesarsway/files/styles/large_article_preview/public/All-about-puppies--Cesar%E2%80%99s-tips%2C-tricks-and-advice.jpg?itok=bi9xUvwe' });
				}

				// if ()
				// if (changeObject.activeLink && changeObject.activeLink.attrs.href === '') {
				// 	setTimeout(()=> {
				// 		changeObject.activeLink.updateAttrs({ href: 'https://www.pubpub.org' });
				// 	}, 2000);
				// }
				// if (changeObject.activeLink && changeObject.activeLink.attrs.href === 'https://www.pubpub.org') {
				// 	setTimeout(()=> {
				// 		changeObject.activeLink.removeLink();
				// 	}, 2000);
				// }
				// if (thing === false) {
				// 	thing = true;
				// 	changeObject.insertFunctions.image({ url: 'https://www.cesarsway.com/sites/newcesarsway/files/styles/large_article_preview/public/All-about-puppies--Cesar%E2%80%99s-tips%2C-tricks-and-advice.jpg?itok=bi9xUvwe' });
				// }
			}}
			// collaborativeOptions={{
			// 	firebaseConfig: firebaseConfig,
			// 	editorKey: 'storybook-editor-v22',
			// 	clientData: clientData,
			// 	// onClientChange: (val)=> { console.log('clientChange ', val); },
			// 	// onStatusChange: (val)=> { console.log('statusChagnge ', val); },
			// }}
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
