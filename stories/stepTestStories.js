/* eslint-disable no-console */
import React from 'react';
import { storiesOf } from '@storybook/react';
import { Node } from 'prosemirror-model';
import { Step, Transform, Mapping, AddMarkStep } from 'prosemirror-transform';
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
			console.log('----');
			console.log(JSON.stringify(mapping.maps));
			console.log(JSON.stringify(step.toJSON()));
			console.log(JSON.stringify(mappedStep.toJSON()));
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

storiesOf('Editor', module).add('stepTesting', () => {
	const schema = buildSchema();
	const doc = Node.fromJSON(schema, emptyDoc);
	const tr = new Transform(doc);
	const hydratedSteps = steps.map((step) => {
		return Step.fromJSON(schema, step);
	});
	const adjustedSteps = adjustSteps(doc, schema, hydratedSteps, 2);
	adjustedSteps.forEach((step) => {
		tr.step(step);
	});
	const generatedDoc = tr.doc;
	return (
		<Editor
			placeholder="Begin writing..."
			initialContent={generatedDoc.toJSON()}
			isReadOnly={true}
		/>
	);
});
