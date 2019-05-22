import React, { useState, useRef } from 'react';
import { storiesOf } from '@storybook/react';
// import ReactDOM from 'react-dom';
// import { Node, DOMSerializer } from 'prosemirror-model';
// import { ChangeSet, simplifyChanges } from 'prosemirror-changeset';
import { Plugin, PluginKey } from 'prosemirror-state';
import { Transform, Step } from 'prosemirror-transform';
// import { DecorationSet, Decoration } from 'prosemirror-view';

import Editor, { buildSchema } from '../src/index';
// import sampleDoc from './initialDocs/plainDoc';
import emptyDoc from './initialDocs/emptyDoc';
import { adjustSteps2 } from './stepTestStories';

const editorSchema = buildSchema();
const captureStepsPluginKey = new PluginKey('captureSteps');

const createCaptureStepsPlugin = () =>
	new Plugin({
		key: captureStepsPluginKey,
		state: {
			init: () => {
				return [];
			},
			apply: (transaction, value) => {
				return [...value, ...transaction.steps];
			},
		},
	});

const createDiffDoc = (doc, schema, hydratedSteps, divergeKey) => {
	const empty = schema.nodeFromJSON(doc);
	const fixedSteps = hydratedSteps.map((step) => {
		return Step.fromJSON(schema, step.toJSON());
	});
	const adjustedSteps = adjustSteps2(empty, schema, fixedSteps, divergeKey);
	const tr = new Transform(empty);
	adjustedSteps.forEach((step) => {
		tr.step(step);
	});
	return tr.doc;
};

const initialDoc = (doc) => (doc.toJSON ? doc.toJSON() : doc);

const TrackChangesDemo = () => {
	const [isEditingRight, setEditingRight] = useState(false);
	const [forkedAt, setForkedAt] = useState(Date.now());
	const [mergedAt, setMergedAt] = useState(Date.now());
	const [divergeKey, setDivergeKey] = useState(0);
	const [leftSteps, setLeftSteps] = useState([]);
	const [rightSteps, setRightSteps] = useState([]);
	// We need to use refs here because Prosemirror doesn't really obey the React model
	const leftDoc = useRef(editorSchema.nodeFromJSON(emptyDoc));
	const rightDoc = useRef(editorSchema.nodeFromJSON(emptyDoc));

	const forkDocument = () => {
		rightDoc.current = leftDoc.current;
		setForkedAt(Date.now());
		setEditingRight(true);
		setDivergeKey(leftSteps.length);
		setRightSteps(leftSteps);
	};

	const mergeDocument = () => {
		leftDoc.current = rightDoc.current;
		setMergedAt(Date.now());
		setEditingRight(false);
		setLeftSteps(rightSteps);
	};

	const explanation = isEditingRight
		? 'Now make some changes to the editor on the right (the draft branch)'
		: 'Create some changes in the editor on the left (the public branch)';

	const buttonLabel = isEditingRight ? 'Merge right to left' : 'Fork left to right';
	const buttonCallback = isEditingRight ? mergeDocument : forkDocument;

	const diffDoc = createDiffDoc(emptyDoc, editorSchema, rightSteps, divergeKey);

	return (
		<div>
			<div style={{ background: '#EEE', padding: '10px' }}>
				{explanation}{' '}
				<button onClick={buttonCallback} type="button">
					{buttonLabel}
				</button>
			</div>
			<div
				style={{
					display: 'grid',
					gridTemplateColumns: 'repeat(3, 1fr)',
					gridColumnGap: 40,
					height: '80vh',
				}}
			>
				<div style={{ opacity: isEditingRight ? 0.5 : 1, padding: 10 }}>
					<Editor
						placeholder="Submission target doc (public)"
						initialContent={initialDoc(leftDoc.current)}
						isReadOnly={isEditingRight}
						onChange={(editorChangeObject) => {
							const {
								view: { state },
							} = editorChangeObject;
							leftDoc.current = state.doc;
							const nextCapture = captureStepsPluginKey.getState(state);
							setLeftSteps([...leftSteps, ...nextCapture]);
						}}
						customPlugins={{
							captureSteps: () => createCaptureStepsPlugin(),
						}}
						key={mergedAt}
					/>
				</div>
				<div style={{ opacity: isEditingRight ? 1 : 0.5, padding: 10 }}>
					<Editor
						placeholder="Submission origin doc (draft)"
						initialContent={initialDoc(rightDoc.current)}
						isReadOnly={!isEditingRight}
						onChange={(editorChangeObject) => {
							const {
								view: { state },
							} = editorChangeObject;
							rightDoc.current = state.doc;
							const nextCapture = captureStepsPluginKey.getState(state);
							setRightSteps([...rightSteps, ...nextCapture]);
						}}
						customPlugins={{
							captureSteps: () => createCaptureStepsPlugin(),
						}}
						key={forkedAt}
					/>
				</div>
				<div style={{ opacity: isEditingRight ? 1 : 0.5, padding: 10 }}>
					<Editor
						placeholder="Diff from left to right"
						initialContent={initialDoc(diffDoc)}
						isReadOnly={true}
						onChange={() => {}}
						key={rightSteps.length}
					/>
				</div>
			</div>
		</div>
	);
};

storiesOf('Editor', module).add('stepTestingPanels', () => {
	return <TrackChangesDemo />;
	// const schema = buildSchema();
	// const doc = Node.fromJSON(schema, emptyDoc);
	// const tr = new Transform(doc);
	// const hydratedSteps = steps.map((step) => {
	// 	return Step.fromJSON(schema, step);
	// });
	// const adjustedSteps = adjustSteps2(doc, schema, hydratedSteps, 0);
	// adjustedSteps.forEach((step) => {
	// 	tr.step(step);
	// });
	// const generatedDoc = tr.doc;
	// // console.log(JSON.stringify(generatedDoc.toJSON()));

	// return (
	// 	<Editor
	// 		placeholder="Begin writing..."
	// 		initialContent={generatedDoc.toJSON()}
	// 		isReadOnly={true}
	// 	/>
	// );
});
