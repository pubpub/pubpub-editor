/* eslint-disable no-console */
import React from 'react';
import { storiesOf } from '@storybook/react';
import { Node } from 'prosemirror-model';
import { Step, Transform, Mapping, AddMarkStep, ReplaceStep, StepMap } from 'prosemirror-transform';
import steps from './data/steps_AaBb';
import emptyDoc from './initialDocs/emptyDoc';
import { buildSchema } from '../src/utilities';
import Editor from '../src/index';

const adjustSteps = (doc, schema, stepsToAdjust, startIndex) => {
	const tr = new Transform(doc);
	const mapping = new Mapping();
	const newSteps = [];
	stepsToAdjust.forEach((step, index) => {
		if (index < startIndex) {
			/* Before the track changes starts */
			newSteps.push(step);
			tr.step(step);
		} else if (step.from === step.to) {
			/* If it's an insertion */
			const mappedStep = step.map(mapping);
			// console.log('----');
			// console.log(JSON.stringify(mapping.maps));
			// console.log(JSON.stringify(step.toJSON()));
			// console.log(JSON.stringify(mappedStep.toJSON()));
			// console.log(mappedStep.slice.content)
			newSteps.push(mappedStep);
			newSteps.push(
				new AddMarkStep(
					mappedStep.from,
					mappedStep.from + mappedStep.slice.content.size,
					schema.marks.strong.create(),
				),
			);
			tr.step(step);
		} else {
			/* If it's a deletion */
			const mappedStep = step.map(mapping);
			const invertedStep = mappedStep.invert(tr.doc);
			console.log('----');
			console.log(JSON.stringify(mappedStep.toJSON()));
			console.log(JSON.stringify(invertedStep.toJSON()));
			newSteps.push(mappedStep);
			newSteps.push(invertedStep);
			newSteps.push(
				new AddMarkStep(
					invertedStep.from,
					invertedStep.from + invertedStep.slice.content.size,
					schema.marks.strike.create(),
				),
			);
			mapping.appendMap(invertedStep.getMap());

			tr.step(mappedStep);
			tr.step(invertedStep);
		}
	});
	return newSteps;
};

/*
Does adding anything other than text require some clever code?
For paragraphs, the thing you're trying to wrap a mark around (either the inserted slice, or the slice of the inverted step)
needs to be checked to see if we simply apply a mark, or apply a node mark?

For every step - break it down into it's insertions and deletions?

forEach(steps)
	if hasInsertion
		genInsertionSteps
			if text
				apply mark
			if node
				apply mark to node
	if hasDeletion
		genDeletionSteps
			if text
				apply mark
			if node
				apply mark to node


*/

const avoidDoubleCountingMaps = (oldMapping, newMap) => {
	const newestMapping = new Mapping();
	// const properNewMapRanges = [];
	console.log(oldMapping, newMap, '###');

	oldMapping.maps.forEach((oldMap) => {
		oldMap.forEach((om_oldStart, om_oldEnd, om_newStart, om_newEnd) => {
			newMap.forEach((oldStart, oldEnd, newStart, newEnd) => {
				console.log(om_oldStart, om_oldEnd, om_newStart, om_newEnd);
				console.log(oldStart, oldEnd, newStart, newEnd);
				// const offsetStart = Math.max(0, om_newStart - newStart);
				// const offsetEnd = Math.max(0, om_newEnd - newEnd);
				const offsetStart =
					om_newStart > newStart && om_newStart < newEnd ? newEnd - om_newStart : 0;
				const offsetEnd =
					om_newEnd > newStart && om_newEnd < newEnd ? newEnd - om_newEnd : 0;
				// Math.max(0, newStart - om_newStart);
				// const offsetEnd = Math.max(0, newEnd - om_newEnd);
				const offset = offsetStart - offsetEnd;
				const thisNewStepMap = new StepMap([
					om_newStart,
					om_oldEnd - om_oldStart,
					om_newEnd - om_newStart - offset,
				]);
				newestMapping.appendMap(thisNewStepMap);
			});
		});
	});
	newestMapping.appendMap(newMap);
	console.log('!!', newestMapping.maps);
	return newestMapping;

	// newMap.forEach((oldStart, oldEnd, newStart, newEnd) => {
	// 	console.log('zing', oldMapping.maps);
	// 	oldMapping.maps.forEach((oldMap) => {
	// 		console.log('zop', oldMap);
	// 		oldMap.forEach((om_oldStart, om_oldEnd, om_newStart, om_newEnd) => {
	// 			console.log('wtf');
	// 			console.log(oldStart, oldEnd, newStart, newEnd);
	// 			console.log(om_oldStart, om_oldEnd, om_newStart, om_newEnd);
	// 			const offsetStart = Math.max(0, newStart - om_newStart);
	// 			const offsetEnd = Math.max(0, newEnd - om_newEnd);
	// 			const offset = offsetStart + offsetEnd;
	// 			console.log(offset);
	// 			properNewMapRanges.push(newStart);
	// 			properNewMapRanges.push(oldEnd - oldStart);
	// 			properNewMapRanges.push(newEnd - newStart - offset);
	// 		});
	// 	});
	// });
	// console.log('@@@', properNewMapRanges);
	// return new StepMap(properNewMapRanges);
};

/* eslint-disable-next-line import/prefer-default-export */
export const adjustSteps2 = (doc, schema, stepsToAdjust, startIndex) => {
	/* The header and structure-gap-replace with replace around */
	/* is wonky because the inputRules plugin is removing '# ' */
	/* and replacing it with headers. It's a problem when we try to invert */
	/* the removal of '# ' */
	console.log('********');
	stepsToAdjust.forEach((step) => {
		console.log(JSON.stringify(step.toJSON()));
	});
	const tr = new Transform(doc);
	let mapping = new Mapping();
	// const newSteps = [];
	stepsToAdjust.forEach((step, index) => {
		console.log('Mapping is', mapping.maps, step.jsonID);
		/* TODO: need to be more rigorous about detecting mightBeInputRule */
		/* We should verify that the item that is being removed matches */
		/* one of the regexes */
		const mightBeInputRule =
			stepsToAdjust.length > index + 1 &&
			stepsToAdjust[index + 1].jsonID === 'replaceAround' &&
			step.to - step.from === 1;

		if (index < startIndex || step.jsonID !== 'replace' || mightBeInputRule) {
			/* Before the track changes starts */
			// newSteps.push(step);
			tr.step(step);
		} else {
			const hasInsertion = !!step.slice.content.size;
			const hasDeletion = step.to - step.from > 0;

			console.log('hasInsertion: ', hasInsertion, '. hasDeletion: ', hasDeletion);
			const mappedStep = step.map(mapping);
			console.log('unmapped', JSON.stringify(step.toJSON()));
			console.log('mapped', JSON.stringify(mappedStep.toJSON()));
			// newSteps.push(mappedStep);
			const docBeforeStep = tr.doc;
			tr.step(mappedStep);
			if (hasDeletion) {
				/* If it's a deletion */
				// mapping.appendMap(mappedStep.getMap());
				const invertedStep = mappedStep.invert(docBeforeStep);
				const deletionMark = schema.marks.strike.create();
				console.log('invertedStep', invertedStep);
				// mapping.appendMap(invertedStep.getMap());

				mapping = avoidDoubleCountingMaps(mapping, invertedStep.getMap());
				invertedStep.slice.content.forEach((node, offset, nodeIndex) => {
					console.log('!', node);
					if (node.type.name === 'paragraph') {
						node.attrs = { ...node.attrs, class: 'deleted' };
						/* TODO:  dive into child contents and apply marks */
						// invertedStep.slice.content = invertedStep.slice.content.replaceChild(
						// 	nodeIndex,
						// 	node.mark(deletionMark.addToSet(node.marks)),
						// );
					}
					// return node;
				});
				console.log('$$', invertedStep);
				tr.step(invertedStep);
				// console.log(tr.doc.toJSON());
				let startingPoint = invertedStep.from;
				invertedStep.slice.content.forEach((node, offset) => {
					console.log('offset is', offset);
					startingPoint += offset;
					if (node.type.name === 'text') {
						console.log(startingPoint, startingPoint + node.text.length, node);
						tr.addMark(startingPoint, startingPoint + node.text.length, deletionMark);
						startingPoint += node.text.length;
					} else {
						console.log('here iwth node', node);
						// console.log(startingPoint);
						// console.log(node.type, node.attrs, deletionMark.addToSet(node.marks));
						// tr.doc.descendants((thisnode, pos, parent) => {
						// 	console.log(thisnode, pos);
						// 	return false;
						// });
						// console.log(tr.doc.nodeAt(startingPoint).type.name, node.type.name)
						// if (tr.doc.nodeAt(startingPoint - 1).type.name === node.type.name) {
						// 	// console.log('node at the thing is', tr.doc.nodeAt(startingPoint));
						// 	tr.setNodeMarkup(
						// 		startingPoint - 1,
						// 		node.type,
						// 		// node.attrs,
						// 		{ ...node.attrs, class: 'deleted' },
						// 		// deletionMark.addToSet(node.marks), This is throwing an error
						// 	);
						// }
						if (node.content) {
							node.content.forEach((node2, offset2) => {
								console.log('node2content', node2, startingPoint + offset2);
								tr.addMark(
									startingPoint + offset2,
									startingPoint + offset2 + node2.text.length,
									deletionMark,
								);
							});
						}
					}
				});
				if (hasInsertion) {
					const insertionMark = schema.marks.strong.create();
					const start = mappedStep.to;
					const newReplaceStep = new ReplaceStep(start, start, mappedStep.slice);
					// console.log('&&&', newReplaceStep.getMap());
					// mapping.appendMap(newReplaceStep.getMap());
					mapping = avoidDoubleCountingMaps(mapping, newReplaceStep.getMap());
					tr.step(newReplaceStep);
					tr.addMark(start, start + mappedStep.slice.content.size, insertionMark);
					// tr.replaceRange(mappedStep.from, mappedStep.from, mappedStep.slice);
				}
			}
			if (hasInsertion && !hasDeletion) {
				let startingPoint = mappedStep.from;
				mappedStep.slice.content.forEach((node) => {
					const insertionMark = schema.marks.strong.create();
					if (node.type.name === 'text') {
						tr.addMark(startingPoint, startingPoint + node.text.length, insertionMark);
						startingPoint += node.text.length;
					} else {
						console.log('%%%', node);
						// console.log(node);
						// console.log(startingPoint);
						if (tr.doc.nodeAt(startingPoint)) {
							tr.setNodeMarkup(
								startingPoint,
								node.type,
								// node.attrs,
								{ ...node.attrs, class: 'inserted' },
								// insertionMark.addToSet(node.marks), This is throwing an error
							);
						}
						startingPoint += node.content.size || 1;
					}
				});
			}
		}
		// console.log(JSON.stringify(tr.doc.toJSON()));
	});
	return tr.steps;
};

storiesOf('Editor', module).add('stepTesting', () => {
	const schema = buildSchema();
	const doc = Node.fromJSON(schema, emptyDoc);
	const tr = new Transform(doc);
	const hydratedSteps = steps.map((step) => {
		return Step.fromJSON(schema, step);
	});
	const adjustedSteps = adjustSteps2(doc, schema, hydratedSteps, 1);
	adjustedSteps.forEach((step) => {
		tr.step(step);
	});
	const generatedDoc = tr.doc;
	// console.log(JSON.stringify(generatedDoc.toJSON()));

	return (
		<Editor
			placeholder="Begin writing..."
			initialContent={generatedDoc.toJSON()}
			isReadOnly={true}
		/>
	);
});


// 1) Apply the appended Steps with mapping logic
// 2) Reorder/group adjacent text blocks with same ins/del marks
// 3) Look at adjacent text blocks with ins/del and cancel-out start/end text

// insertion, deletion, change