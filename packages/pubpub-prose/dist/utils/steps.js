'use strict';

var _prosemirrorTransform = require('prosemirror-transform');

var _setup = require('../setup');

var applyDiffs = function applyDiffs(_ref) {
  var state = _ref.state,
      diffs = _ref.diffs,
      schema = _ref.schema;


  (0, _setup.migrateDiffs)(diffs);
  var tr = state.tr;
  var steps = diffs.map(function (jIndex) {
    return _prosemirrorTransform.Step.fromJSON(schema, jIndex);
  });
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = steps[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var step = _step.value;

      tr.step(step);
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  var action = tr.action();
  return state.applyAction(action);
};

var applyDiffsSequential = function applyDiffsSequential(_ref2) {
  var state = _ref2.state,
      diffs = _ref2.diffs,
      schema = _ref2.schema;

  var action = null;
  var newState = state;
  var _iteratorNormalCompletion2 = true;
  var _didIteratorError2 = false;
  var _iteratorError2 = undefined;

  try {
    for (var _iterator2 = diffs[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
      var diff = _step2.value;

      try {
        //const steps = [diff].map(jIndex => Step.fromJSON(pubSchema, jIndex));
        var newDiffs = [diff];
        newState = applyDiffs({ state: newState, diffs: newDiffs, schema: schema });
      } catch (err) {
        console.log('ERROR WITH STEP: ', err);
        console.log('ERROR ON CURRENT DIFF', diff);
      }
    }
  } catch (err) {
    _didIteratorError2 = true;
    _iteratorError2 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion2 && _iterator2.return) {
        _iterator2.return();
      }
    } finally {
      if (_didIteratorError2) {
        throw _iteratorError2;
      }
    }
  }

  return newState;
};

exports.applyDiffs = applyDiffs;

exports.applySafeDiffs = function (_ref3) {
  var state = _ref3.state,
      diffs = _ref3.diffs,
      schema = _ref3.schema;

  try {
    return applyDiffs({ state: state, diffs: diffs, schema: schema });
  } catch (err) {
    return applyDiffsSequential({ state: state, diffs: diffs, schema: schema });
  }
};