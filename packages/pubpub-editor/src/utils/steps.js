import { Step, Transform } from 'prosemirror-transform';

import { migrateDiffs } from '../migrate/migrateDiffs';

const applyDiffs = ({ state, diffs, schema }) => {

  migrateDiffs(diffs);
  const tr = state.tr;
	const steps = diffs.map(jIndex => {
    return Step.fromJSON(schema, jIndex);
  });
	for (const step of steps) {
    tr.step(step);
  }

  const action = tr.action();
	return state.applyAction(action);
};


const applyDiffsSequential = ({ state, diffs, schema }) => {
	let action = null;
  let newState = state;
	for (const diff of diffs) {
		try {
			//const steps = [diff].map(jIndex => Step.fromJSON(pubSchema, jIndex));
      const newDiffs = [diff];
			newState = applyDiffs({state: newState, diffs: newDiffs, schema});
		} catch (err) {
			console.log('ERROR WITH STEP: ', err);
			console.log('ERROR ON CURRENT DIFF', diff);
		}
	}
	return newState;

}


exports.applyDiffs = applyDiffs;

exports.applySafeDiffs = ({ state, diffs, schema }) => {
  try {
    return applyDiffs({state, diffs, schema});
  } catch (err) {
    console.log('could not error!', err);
    return applyDiffsSequential({state, diffs, schema});
  }

};
