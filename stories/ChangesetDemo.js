import React, { useState, useRef } from 'react';
import { ChangeSet } from 'prosemirror-changeset';
import { DOMSerializer } from 'prosemirror-model';
import { Plugin, PluginKey } from 'prosemirror-state';
import { DecorationSet, Decoration } from 'prosemirror-view';

import Editor, { buildSchema } from '../src/index';
import emptyDoc from './initialDocs/emptyDoc';

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
				if (transaction.docChanged) {
					return [...value, ...transaction.steps];
				}
				return value;
			},
		},
	});

const createChangesetPlugin = (changeset, oldDoc) =>
	new Plugin({
		props: {
			decorations: (state) => {
				const { changes } = changeset;
				const doc = state.doc;
				const decorations = changes.map((change) => {
					const output = [];
					if (change.inserted.length) {
						output.push(
							Decoration.inline(change.fromB, change.toB, {
								class: 'addition',
							}),
						);
					}
					if (change.deleted) {
						const slice = oldDoc.slice(change.fromA, change.toA);
						const elem = document.createElement('span');
						const serializer = DOMSerializer.fromSchema(editorSchema);
						elem.appendChild(serializer.serializeFragment(slice.content));
						elem.className = 'deletion';
						output.push(Decoration.widget(change.fromB, elem));
					}
					return output;
				});

				const flattenArray = [].concat(...decorations);
				return DecorationSet.create(doc, flattenArray);
			},
		},
	});

const createChangeSet = (oldDoc, newDoc, newDocSteps, divergeKey) => {
	const changeset = ChangeSet.create(oldDoc);
	const diffSteps = newDocSteps.slice(divergeKey);
	return changeset.addSteps(newDoc, diffSteps.map((step) => step.getMap()));
};

const initialDoc = (doc) => (doc.toJSON ? doc.toJSON() : doc);

const ChangesetDemo = () => {
	const [isEditingRight, setEditingRight] = useState(false);
	const [forkedAt, setForkedAt] = useState(Date.now());
	const [mergedAt, setMergedAt] = useState(Date.now());
	const [divergeKey, setDivergeKey] = useState(0);
	const [leftSteps, setLeftSteps] = useState([]);
	const [rightSteps, setRightSteps] = useState([]);
	// We need to use refs here because Prosemirror doesn't really obey the React model
	const leftDoc = useRef(emptyDoc);
	const rightDoc = useRef(emptyDoc);

	const forkDocument = () => {
		setForkedAt(Date.now());
		setEditingRight(true);
		setDivergeKey(leftSteps.length);
		rightDoc.current = leftDoc.current;
		setRightSteps(leftSteps);
	};

	const mergeDocument = () => {
		setMergedAt(Date.now());
		setEditingRight(false);
		leftDoc.current = rightDoc.current;
		setLeftSteps(rightSteps);
	};

	const explanation = isEditingRight
		? 'Now make some changes to the editor on the right (the draft branch)'
		: 'Create some changes in the editor on the left (the public branch)';

	const buttonLabel = isEditingRight ? 'Merge right to left' : 'Fork left to right';
	const buttonCallback = isEditingRight ? mergeDocument : forkDocument;

	const changeset =
		divergeKey > 0 &&
		createChangeSet(leftDoc.current, rightDoc.current, rightSteps, divergeKey);

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
					gridTemplateColumns: '1fr 1fr',
					gridTemplateRows: '1fr 1fr',
					gridColumnGap: 40,
					gridRowGap: 40,
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
				<div
					style={{
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						background: '#DDD',
					}}
				>
					(This space intentionally left blank)
				</div>
				<div style={{ opacity: isEditingRight ? 1 : 0.5, padding: 10 }}>
					<Editor
						placeholder="Diff from left to right"
						initialContent={initialDoc(rightDoc.current)}
						isReadOnly={true}
						onChange={() => {}}
						key={rightSteps.length}
						customPlugins={
							changeset && {
								changeset: () => createChangesetPlugin(changeset, leftDoc.current),
							}
						}
					/>
				</div>
			</div>
		</div>
	);
};

export default ChangesetDemo;
