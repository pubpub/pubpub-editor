'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _prosemirrorTransform = require('prosemirror-transform');

var _prosemirrorView = require('prosemirror-view');

var _prosemirrorModel = require('prosemirror-model');

var _pluginKeys = require('./pluginKeys');

var _commits = require('./commits');

var _prosemirrorState = require('prosemirror-state');

var _require = require('prosemirror-state'),
    Selection = _require.Selection;

var _require2 = require('prosemirror-transform'),
    Step = _require2.Step,
    findWrapping = _require2.findWrapping,
    Mapping = _require2.Mapping;

/*
- How to store in a firebase account?
- How to not store marks in steps?
*/

/*
  if you only store deletions in a map, then inevitably it will be removeD?
  instead store deletions to remove after a certain map?
  e.g. store at POS 34, remove 4. at pos 40, remove 5
  How to represent deleted items? Can't use widgets because of removal
*/

/*
NEED TO STORE OFFSETS IN FIREBASE!!!

*/

/*
Sketch of one channel merge:
  - Gather all steps
  -

*/

// need to store an array of steps that recreate the original document
// need to store mappings that remove additions

// keep a track of commits
// check if the new commit is not near the others
// otherwise, keep grouping until it happens


// keep a mapping of all steps/domains?


function isAdjacentToLastStep(step, prevMap) {
  if (!prevMap) return false;
  var firstMap = step.getMap(),
      adjacent = false;
  if (!firstMap) return true;
  firstMap.forEach(function (start, end) {
    prevMap.forEach(function (_start, _end, rStart, rEnd) {
      if (start <= rEnd && end >= rStart) adjacent = true;
    });
    return false;
  });
  return adjacent;
}

// commitUUID
// UUIDs enable easy tracking of commits
/*

  - how to make the current commit a combination of all steps?
  - make current commit store last key?

*/

// make a class with functions?
// how to update stored steps?
var trackChangesPlugin = new _prosemirrorState.Plugin({
  state: {
    init: function init(config, instance) {
      var _this = this;

      this.storedSteps = [];
      this.sendableSteps = [];
      this.stepOffsets = [];
      this.sendableOffsets = [];

      this.transactions = {};

      this.tracker = new _commits.CommitTracker(this);

      this.storeStep = function (step) {
        _this.tracker.add(step);
        if (step.slice && step.slice.content) {
          var _iteratorNormalCompletion = true;
          var _didIteratorError = false;
          var _iteratorError = undefined;

          try {
            for (var _iterator = step.slice.content.content[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
              var stepContent = _step.value;

              var marks = stepContent.marks;
              var diffPlusMark = _this.view.state.schema.marks['diff_plus'];
              var diffMinusMark = _this.view.state.schema.marks['diff_minus'];
              stepContent.marks = diffMinusMark.removeFromSet(diffPlusMark.removeFromSet(marks));
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
        }
        _this.storedSteps.push(step);
        _this.sendableSteps.push(step);
      };

      this.storeOffset = function (stepOffset) {
        _this.stepOffsets.push(stepOffset);
        _this.sendableOffsets.push(stepOffset);
      };

      this.getSendableSteps = function () {
        var steps = _this.sendableSteps;
        var offsets = _this.sendableOffsets;

        _this.sendableSteps = [];
        _this.sendableOffsets = [];

        if (steps.length > 0 || offsets.length > 0) {
          return { steps: steps, offsets: offsets };
        }
        return null;
      };

      return {
        deco: _prosemirrorView.DecorationSet.empty, commit: null
      };
    },
    apply: function apply(transaction, state, prevEditorState, editorState) {

      return state;
    }
  },

  appendTransaction: function appendTransaction(transactions, oldState, newState) {
    var _this2 = this;

    var firstTransaction = transactions[0];
    if (!firstTransaction || transactions.length > 1) {
      return;
    }
    var transaction = firstTransaction;

    if (transaction.getMeta("trackAddition") || transaction.getMeta("backdelete") || transaction.getMeta('history$') || transaction.getMeta('collab$')) {
      return;
    }

    var schema = this.view.state.schema;

    if (transaction.mapping && transaction.mapping.maps.length > 0) {
      var sel = newState.selection;
      var pos = sel.$from;

      /*
        For each step in the transaction, adjust the positions of the steps
        according to the step offsets stored. Step offsets store additions to the document
        mainly deletions
      */
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = transaction.steps[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var _step4 = _step2.value;

          var mappedStep = _step4;
          var totalOffset = 0;

          var _iteratorNormalCompletion4 = true;
          var _didIteratorError4 = false;
          var _iteratorError4 = undefined;

          try {
            for (var _iterator4 = this.stepOffsets[Symbol.iterator](), _step5; !(_iteratorNormalCompletion4 = (_step5 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
              var stepOffset = _step5.value;

              if (mappedStep.from > stepOffset.index) {
                totalOffset = totalOffset + stepOffset.size;
              }
            }
          } catch (err) {
            _didIteratorError4 = true;
            _iteratorError4 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion4 && _iterator4.return) {
                _iterator4.return();
              }
            } finally {
              if (_didIteratorError4) {
                throw _iteratorError4;
              }
            }
          }

          mappedStep = mappedStep.offset(totalOffset * -1);
          this.storeStep(mappedStep);
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

      if (!pos.parent || !pos.parent.nodeType || pos.parent.nodeType.name !== 'diff') {
        var _ret = function () {

          var tr = newState.tr;

          var mappings = transaction.mapping.maps;

          var _iteratorNormalCompletion3 = true;
          var _didIteratorError3 = false;
          var _iteratorError3 = undefined;

          try {
            var _loop = function _loop() {
              var step = _step3.value;

              var map = step.getMap();

              if (step instanceof _prosemirrorTransform.AddMarkStep || step instanceof _prosemirrorTransform.ReplaceAroundStep) {
                tr = tr.addMark(step.from, step.to, schema.mark('diff_plus', { commitID: _this2.tracker.uuid }));
                tr.setMeta("trackAddition", true);
                return 'continue';
              }

              if (!step.slice) {
                return 'continue';
              }

              var slice = step.slice.content;

              map.forEach(function (oldStart, oldEnd, newStart, newEnd) {

                if (oldStart !== oldEnd) {
                  var inverse = step.invert(oldState.doc);

                  /*
                  This checks if it is a 'space operation' that prosemirror does, i.e. it will sometimes replace a space with a space and the character you just typed.
                  */
                  var isSpaceOperation = false;

                  var replacedFragment = step.slice.content;
                  var oldFragment = inverse.slice.content;
                  var fragmentIsText = function fragmentIsText(fragment) {
                    return fragment.content && fragment.content.length === 1 && fragment.content[0].isText === true;
                  };

                  if (fragmentIsText(replacedFragment) && fragmentIsText(oldFragment)) {
                    var replacedNodeText = replacedFragment.content[0].text;
                    var oldNodeText = oldFragment.content[0].text;
                    if (oldNodeText.charAt(0).trim() == '' && replacedNodeText.length === 2 && replacedNodeText.charAt(0).trim() == '') {
                      isSpaceOperation = true;
                    }
                  }

                  if (isSpaceOperation) {
                    tr = tr.addMark(newStart, newEnd, schema.mark('diff_plus', { commitID: _this2.tracker.uuid }));
                    return;
                  }

                  tr = tr.step(inverse);
                  var _slice = step.slice.content;
                  var possibleInsert = tr.mapping.map(newEnd, 1);

                  if (step.slice.size > 0) {
                    var insertstep = (0, _prosemirrorTransform.replaceStep)(oldState.doc, possibleInsert, possibleInsert, step.slice.size > 0 ? step.slice : _prosemirrorModel.Slice.empty);
                    var newOffset = { index: oldEnd, size: inverse.slice.size };
                    _this2.stepOffsets.push(newOffset);
                    _this2.storeOffset(newOffset);
                    try {
                      tr = tr.step(insertstep);
                    } catch (err) {
                      console.log('cannot do this!', insertstep, step);
                      console.log(err);
                    }
                    tr = tr.addMark(oldStart, oldEnd, schema.mark('diff_minus', { commitID: _this2.tracker.uuid }));
                    var insertStart = tr.mapping.map(newEnd, -1);
                    var insertEnd = tr.mapping.map(newEnd, 1);
                    tr = tr.addMark(insertStart, insertEnd, schema.mark('diff_plus', { commitID: _this2.tracker.uuid }));
                  } else {
                    var _insertStart = tr.mapping.map(newEnd, -1);
                    var _insertEnd = tr.mapping.map(newEnd, 1);
                    tr = tr.addMark(oldStart, oldEnd, schema.mark('diff_minus', { commitID: _this2.tracker.uuid }));
                    var _newOffset = { index: oldEnd, size: inverse.slice.size };
                    _this2.stepOffsets.push(_newOffset);
                    _this2.storeOffset(_newOffset);
                    // tr = tr.addMark(insertStart, insertEnd, schema.mark('diff_plus', { commitID: this.commitID }));
                  }
                  /*
                  let i;
                  let lastRange = null;
                  for (i = oldStart; i <= oldEnd; i++) {
                    const incrementPos = tr.doc.resolve(oldStart);
                    const incrementPos = tr.doc.resolve(oldStart);
                  }
                  */
                  // tr = tr.addMark(oldStart, oldEnd, schema.mark('diff_minus', {}));

                  tr.setMeta("backdelete", true);
                  tr.setMeta("trackAddition", true);
                  //  transaction.setMeta('appendedTransaction', true);
                } else {
                  tr = tr.addMark(newStart, newEnd, schema.mark('diff_plus', { commitID: _this2.tracker.uuid }));
                  tr.setMeta("trackAddition", true);
                  //  transaction.setMeta('appendedTransaction', true);
                }
              });
            };

            for (var _iterator3 = transaction.steps[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
              var _ret2 = _loop();

              if (_ret2 === 'continue') continue;
            }
          } catch (err) {
            _didIteratorError3 = true;
            _iteratorError3 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion3 && _iterator3.return) {
                _iterator3.return();
              }
            } finally {
              if (_didIteratorError3) {
                throw _iteratorError3;
              }
            }
          }

          return {
            v: tr
          };
        }();

        if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
      }
      return null;
    }
    return null;
  },
  view: function view(_view) {
    var _this3 = this;

    this.view = _view;
    return {
      update: function update(newView, prevState) {
        _this3.view = newView;
      },
      destroy: function destroy() {
        _this3.view = null;
      }
    };
  },
  key: _pluginKeys.keys.track,
  props: {
    updateCommits: function updateCommits(commits) {
      this.commits = commits;
    },
    updateCommitID: function updateCommitID(commitID) {
      this.commitID = commitID;
    },
    getTrackedSteps: function getTrackedSteps() {
      return this.storedSteps;
    },
    handleKeyDown: function handleKeyDown(view, event) {
      if (event.code === 'Backspace') {
        var sel = view.state.selection;
        var pos = sel.$from;
        var tr = view.state.tr;
        // what if they delete a region??
        var beforeSel = Selection.findFrom(view.state.doc.resolve(sel.from - 1), -1, true);
        var marks = beforeSel.$from.marks();
        var hasDiff = marks.find(function (mark) {
          return mark.type.name === 'diff_plus';
        });
        var deleteStep = (0, _prosemirrorTransform.replaceStep)(tr.doc, beforeSel.from, sel.from, _prosemirrorModel.Slice.empty);
        if (hasDiff) {
          // need to actually delete it but then avoid random deletions
          this.storeStep(deleteStep);
          tr.step(deleteStep);
          tr.setMeta('backdelete', true);
          view.dispatch(tr);
          return true;
        }
        // is this step size always 1??
        var newOffset = { index: beforeSel.from, size: 1 };
        this.storeStep(deleteStep);
        this.stepOffsets.push(newOffset);
        this.storeOffset(newOffset);

        tr = tr.addMark(beforeSel.from, sel.from, schema.mark('diff_minus', { commitID: this.tracker.uuid }));
        tr = tr.setSelection(beforeSel);
        tr.setMeta('backdelete', true);
        tr.setMeta('trackAddition', true);
        //tr.setMeta('appendedTransaction', true);

        view.dispatch(tr);

        return true;
      }
    }

  }
});

exports.default = trackChangesPlugin;