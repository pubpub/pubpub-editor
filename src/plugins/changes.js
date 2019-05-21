import React from 'react';
import { DOMSerializer, Node } from 'prosemirror-model';
import { Plugin } from 'prosemirror-state';
import {
	AddMarkStep,
	Mapping,
	ReplaceStep,
	ReplaceAroundStep,
	RemoveMarkStep,
	Step,
	StepMap,
	Transform,
} from 'prosemirror-transform';

export const changeMarks = {
	addition: {
		toDOM: function() {
			return ['strong', 0];
		},
		parseDOM: [{ tag: 'strong' }],
		toStatic: (mark, children, key) => {
			return (
				<span key={key} className="addition">
					{children}
				</span>
			);
		},
	},
	deletion: {
		toDOM: function() {
			return ['s', 0];
		},
		parseDOM: [{ tag: 's' }],
		toStatic: (mark, children, key) => {
			return (
				<span key={key} className="deletion">
					{children}
				</span>
			);
		},
	},
};

export const sanitizeStep = (step, schema) => {
	return Step.fromJSON(schema, step.toJSON());
};

export const sanitizeDoc = (doc, schema) => {
	return Node.fromJSON(schema, doc.toJSON());
};

const createAdditionalSteps = (step, doc, schema) => {
	const docSlice = doc.slice(step.from, step.to);
	let sliceIsAddition = false;
	docSlice.content.forEach((child) => {
		if (child.marks.some((mark) => mark.type.name === 'addition')) {
			sliceIsAddition = true;
		}
	});
	if (step instanceof ReplaceStep) {
		if (sliceIsAddition) {
			return [];
		}
		// Invert the replacement...
		const deletionSize = step.to - step.from;
		const additionSize = step.slice.size;
		const addReplacedStep = new ReplaceStep(step.from, step.from, docSlice);
		const addDeletionMark = new AddMarkStep(step.from, step.to, schema.marks.deletion.create());
		const addAdditionMark =
			additionSize &&
			new AddMarkStep(
				step.from + deletionSize,
				step.to + additionSize + deletionSize,
				schema.marks.addition.create(),
			);
		return [addReplacedStep, addDeletionMark, addAdditionMark];
	}
	return [];
};

const amendStep = (step, doc, schema, futureSteps = []) => {
	const additionalSteps = createAdditionalSteps(step, doc, schema).filter((x) => x);
	const amendedSteps = [step, ...additionalSteps];
	const futureStepsMapping = new Mapping(additionalSteps.map((as) => {
		const addedRange = as.to - as.from;
		return new StepMap([as.from - addedRange, 0, addedRange]);
	}));
	const tr = new Transform(doc);
	console.log('  -- with futureStepsMapping', futureStepsMapping);
	amendedSteps.forEach((as) => tr.step(as));
	return {
		resultingDoc: tr.doc,
		amendedSteps: amendedSteps,
		futureSteps: futureSteps.map((fs) => fs.map(futureStepsMapping)),
	};
};

export const amendThrough = (steps, doc, schema) => {
	const serializer = DOMSerializer.fromSchema(schema);
	const [firstStep, ...restSteps] = steps;
	console.log(
		'amendThrough',
		Array.from(serializer.serializeFragment(doc.content).childNodes)
			.map((node) => node.outerHTML)
			.join(''),
		firstStep,
	);
	if (steps.length === 0) {
		return { doc: doc, steps: [] };
	}
	const { amendedSteps, futureSteps, resultingDoc } = amendStep(
		firstStep,
		doc,
		schema,
		restSteps,
	);
	console.log('  -- with restSteps', restSteps);
	console.log('  -- with amendedSteps', amendedSteps);
	console.log('  -- with futureSteps', futureSteps);
	const { doc: nextDoc, steps: nextSteps } = amendThrough(futureSteps, resultingDoc, schema);
	return { doc: nextDoc, steps: [...amendedSteps, ...nextSteps] };
};
