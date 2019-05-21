import React, { useState, useRef } from 'react';
import ReactDOM from 'react-dom';
import { Node, DOMSerializer } from 'prosemirror-model';
import { ChangeSet, simplifyChanges } from 'prosemirror-changeset';
import { Plugin, PluginKey } from 'prosemirror-state';
import { Step } from 'prosemirror-transform';
import { DecorationSet, Decoration } from 'prosemirror-view';

import Editor, { buildSchema, renderStatic } from '../src/index';
import sampleDoc from './initialDocs/plainDoc';
import emptyDoc from './initialDocs/emptyDoc';
import { amendThrough, changeMarks, sanitizeStep, sanitizeDoc } from '../src/plugins/changes';

const editorSchema = buildSchema({}, { ...changeMarks });
const serializer = DOMSerializer.fromSchema(editorSchema);
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

const createChangesetPlugin = (changeset, oldDoc, newDoc) =>
	new Plugin({
		props: {
			decorations: (state) => {
				// const changes = simplifyChanges(changeset.changes, oldDoc);
				const { changes } = changeset;
				console.log('CHANGES', changes);
				const doc = state.doc;
				const decorations = changes.map((change) => {
					const output = [];
					if (change.inserted.length) {
						const slice = newDoc.slice(change.fromB, change.toB);
						output.push(
							Decoration.inline(change.fromB, change.toB, { class: 'addition' }),
						);
						slice.content.nodesBetween(
							0,
							change.toB - change.fromB,
							(child, position) => {
								const from = change.fromB + position;
								const to = from + child.nodeSize;
								if (child.isBlock && !child.inlineContent) {
									output.push(Decoration.node(from, to, { class: 'addition' }));
								}
								return false;
							},
						);
					}
					if (change.deleted.length) {
						const isBlockNode = false;
						const slice = oldDoc.slice(change.fromA, change.toA);
						// slice.content.descendants((node) => {
						// 	if (node.isBlock) {
						// 		isBlockNode = true;
						// 		return false;
						// 	}
						// 	return null;
						// });
						const elem = document.createElement(isBlockNode ? 'div' : 'span');
						const domFragment = renderStatic(editorSchema, slice.content.toJSON(), {});
						ReactDOM.render(domFragment, elem);
						elem.className = 'deletion';
						output.push(Decoration.widget(change.fromB, elem));
					}
					// change.deleted.forEach((deletion) => {
					// 	let isBlockNode = false;
					// 	// const slice = deletion.data.slice;
					// 	slice.content.descendants((node) => {
					// 		if (node.isBlock) {
					// 			isBlockNode = true;
					// 			return false;
					// 		}
					// 		return null;
					// 	});
					// 	const elem = document.createElement(isBlockNode ? 'div' : 'span');
					// 	const domFragment = renderStatic(editorSchema, slice.content.toJSON(), {});
					// 	ReactDOM.render(domFragment, elem);
					// 	elem.className = 'deletion';
					// 	output.push(Decoration.widget(change.fromB, elem));
					// });
					return output;
				});
				const flattenArray = [].concat(...decorations);
				return DecorationSet.create(doc, flattenArray);
			},
		},
	});

const createDiffDoc = (oldDoc, newDoc, newDocSteps, divergeKey) => {
	const diffSteps = newDocSteps.slice(divergeKey).map((s) => sanitizeStep(s, editorSchema));
	console.log('START');
	const res = amendThrough(diffSteps, sanitizeDoc(oldDoc, editorSchema), editorSchema);
	console.log('END');
	return res;
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

	const { doc: diffDoc, steps: diffSteps } = createDiffDoc(
		leftDoc.current,
		rightDoc.current,
		rightSteps,
		divergeKey,
	);

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
						customMarks={{ ...changeMarks }}
					/>
				</div>
			</div>
		</div>
	);
};

export default ChangesetDemo;
