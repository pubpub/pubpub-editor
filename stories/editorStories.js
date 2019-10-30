/* eslint-disable no-console */
import React, { useState } from 'react';
import { storiesOf } from '@storybook/react';
import Editor, { cursor } from '../src/index';
import { editorWrapperStyle, initFirebase, clientData } from './_utilities';
import initialContent from './initialDocs/plainDoc';
import {
	setLocalHighlight,
	removeLocalHighlight,
	convertLocalHighlightToDiscussion,
} from '../src/utils';

const rootKey = 'test3';
const branchKey = 'branch-f4bf24f7-6184-4f5f-b2d3-2b9d2563cb62';
const firebaseRootRef = initFirebase(rootKey, '');
const firebaseBranchRef = firebaseRootRef.child(branchKey);
const newDiscussionId = String(Math.floor(Math.random() * 999999));

const CursorOptionsDemoPub = () => {
	const [editorView, setEditorView] = useState();

	const cursorButtons = Object.keys(cursor).map((key) => ({
		children: key,
		onClick: () => {
			cursor[key](editorView);
			editorView.focus();
		},
	}));

	return (
		<div style={editorWrapperStyle}>
			<div style={{ display: 'flex' }}>
				{cursorButtons.map((props) => (
					<button type="button" {...props} />
				))}
			</div>
			<Editor
				placeholder="Begin writing..."
				initialContent={initialContent}
				isReadOnly={false}
				onChange={(editorChangeObject) => setEditorView(editorChangeObject.view)}
			/>
		</div>
	);
};

storiesOf('Editor', module)
	.add('default', () => (
		<div style={editorWrapperStyle}>
			<Editor
				placeholder="Begin writing..."
				initialContent={initialContent}
				// isReadOnly={true}
				onChange={(changeObject) => {
					// console.log('====');
					// console.log(JSON.stringify(changeObject.view.state.doc.toJSON(), null, 4));
					// console.log(changeObject.menuItems);
					// console.log(getCollabJSONs(changeObject.view));
					if (changeObject.updateNode && changeObject.selectedNode.attrs.size === 50) {
						changeObject.updateNode({ size: 65 });
					}

					if (
						changeObject.shortcutValues['@'] === 'dog' &&
						changeObject.selection.empty
					) {
						changeObject.shortcutValues.selectShortCut();
						changeObject.insertFunctions.image({
							url:
								'https://www.cesarsway.com/sites/newcesarsway/files/styles/large_article_preview/public/All-about-puppies--Cesar%E2%80%99s-tips%2C-tricks-and-advice.jpg?itok=bi9xUvwe',
						});
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
				highlights={[
					{
						exact: 'Introduction',
						from: '25',
						id: 'abcdefg',
						permanent: false,
						// prefix: 'Hello ',
						// suffix: ' and',
						to: '30',
						version: undefined,
					},
				]}
			/>
		</div>
	))
	.add('collaborative', () => {
		const Thing = () => {
			const [changeObject, updatechangeObject] = useState({});
			return (
				<div style={editorWrapperStyle}>
					{/* <button
						type="button"
						onClick={() => {
							firebaseBranchRef
								.child('discussions')
								.child(Math.floor(Math.random() * 999999))
								.set(getDiscussionData(changeObject.view));
						}}
					>
						New
					</button> */}
					<button
						type="button"
						onClick={() => {
							setLocalHighlight(
								changeObject.view,
								changeObject.view.state.selection.from,
								changeObject.view.state.selection.to,
								newDiscussionId,
							);
						}}
					>
						New Local Highlight
					</button>
					<button
						type="button"
						onClick={() => {
							removeLocalHighlight(changeObject.view, newDiscussionId);
						}}
					>
						Remove Local Highlight
					</button>
					<button
						type="button"
						onClick={() => {
							console.log(
								convertLocalHighlightToDiscussion(
									changeObject.view,
									newDiscussionId,
									firebaseBranchRef,
								),
							);
						}}
					>
						Convert Highlight to Discussion
					</button>

					<Editor
						key={firebaseBranchRef ? 'ready' : 'unready'}
						placeholder="Begin writing..."
						onChange={(evt) => {
							updatechangeObject(evt);
						}}
						collaborativeOptions={{
							firebaseRef: firebaseBranchRef,
							clientData: clientData,
							initialDocKey: -1,
							// onClientChange: () => {},
							// onStatusChange: () => {},
						}}
					/>
				</div>
			);
		};
		return <Thing />;
	})
	.add('readOnly', () => (
		<div style={editorWrapperStyle}>
			<Editor
				placeholder="Begin writing..."
				initialContent={initialContent}
				isReadOnly={true}
				onChange={(changeObject) => {
					console.log(changeObject.view);
				}}
			/>
		</div>
	))
	.add('cursorUtilities', () => <CursorOptionsDemoPub />);
