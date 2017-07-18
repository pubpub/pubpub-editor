"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _prosemirrorState = require("prosemirror-state");

/// ideally backed my markdown for comparisons??

// base off markown and then use mark changes to show them??
// ---> this is a good idea I think. Allows changes to be applied by applying markdown diffs.

// how to serialize to markdown something that has diffs?
// where is the state of the two editors being stored?

// should patches happen on track changes or on diffs?


// flow:
// - a change wraps itself in a 'diff' block which can be serialized
// - deletions are cancelled transforms
// - all diff blocks hold some sort of identifier, clicking accept does the change in markdown
// - do not need to store two possible editors. Can just diff between them as a normal state

var diffPlugin = new _prosemirrorState.Plugin({
  state: {
    init: function init(config, instance) {
      var _require = require("prosemirror-view"),
          DecorationSet = _require.DecorationSet,
          Decoration = _require.Decoration;

      return { deco: DecorationSet.empty,
        linkedEditor: config.linkedEditor,
        originalEditor: config.originalEditor,
        showAsAdditions: config.showAsAdditions
      };
    },
    apply: function apply(action, state, prevEditorState, editorState) {
      var _require2 = require("prosemirror-view"),
          DecorationSet = _require2.DecorationSet,
          Decoration = _require2.Decoration;

      if (action.type === 'transform') {
        state.linkedEditor.linkedTransform();
      }

      if (action.type === 'patch') {
        var diffIndex = action.diffIndex;
        var diff = state.lastDiff[diffIndex];
        //Removals always require an insertion, and possibly a deletion
        //
        if (diff.removed) {
          var textNode = pubSchema.text(text);
          var newT = state.tr.replaceWith(to, to, textNode);
          var _action = {
            type: 'transform',
            transform: newT
          };
          view.props.onAction(_action);
        }
      }

      if (action.type === 'transform' || action.type === 'linkedTransform') {
        var diff1 = state.linkedEditor.getDiffStr();
        var diff2 = state.originalEditor.getDiffStr(editorState);
        var text1 = diff1.diffStr;
        var text2 = diff2.diffStr;

        var diffMap = diff2.diffMap;

        var jsdiff = require('diff');
        var diffResult = jsdiff.diffChars(text1, text2);
        var decos = [];
        var startCount = 0;

        // console.log('Diff result', diffResult);
        // console.log('Diff map', diffMap);
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          var _loop = function _loop() {
            var _step$value = _slicedToArray(_step.value, 2),
                diffIndex = _step$value[0],
                diff = _step$value[1];

            // const strippedString = diff.value.replace(/\s/g, '');
            var strippedString = diff.value;
            if (diff.removed) {
              return "continue";
            }
            if (diff.added) {

              //must find biggest chunk
              var _to = startCount;
              var from = startCount + strippedString.length;

              var ranges = [];
              var lastRange = { type: 'inline', to: null, from: null };
              var lastNode = null;

              // find the contigous ranges and turn them into a map
              // need to join ranges afterwards
              for (var i = _to; i <= from; i++) {
                if (diffMap[i] && diffMap[i].type) {
                  if (lastNode === diffMap[i].index) {
                    continue;
                  }
                  lastNode = diffMap[i].index;
                  ranges.push({
                    type: 'node',
                    to: diffMap[i].index,
                    from: diffMap[i].index + 1
                  });
                  continue;
                } else {
                  lastNode = null;
                }
                if (i === from && diffMap[i] !== undefined) {
                  if (lastRange.to === null) {
                    lastRange.to = diffMap[i];
                    lastRange.from = diffMap[i];
                  } else {
                    lastRange.from = diffMap[i];
                  }
                  ranges.push(lastRange);
                  continue;
                }
                if (diffMap[i] !== undefined && lastRange.to === null) {
                  lastRange.to = diffMap[i];
                } else if (diffMap[i] === undefined && lastRange.to !== null) {
                  lastRange.from = diffMap[i - 1] + 1;
                  ranges.push(lastRange);
                  lastRange = { type: 'inline', to: null, from: null };
                }
                if (i === from && diffMap[i] !== undefined) {
                  if (lastRange.to === null) {
                    lastRange.to = diffMap[i];
                    lastRange.from = diffMap[i] + 1;
                  } else {
                    lastRange.from = diffMap[i] + 1;
                  }
                  ranges.push(lastRange);
                }
              }

              var className = 'diff-marker';
              if (state.showAsAdditions) {
                className += ' added';
              } else {
                className += ' removed';
              }
              className += " diff-index-" + diffIndex;
              var patch = { to: _to, from: from, text: strippedString };

              var patchDecorations = ranges.map(function (range) {
                if (range.type === 'node') {
                  return Decoration.node(range.to, range.from, { class: className }, { diffIndex: diffIndex });
                } else {
                  return Decoration.inline(range.to, range.from, { class: className }, { inclusiveLeft: true,
                    inclusiveRight: true,
                    diffIndex: diffIndex
                  });
                }
              });
              decos = decos.concat(patchDecorations);
              console.log(decos);
            }
            startCount += strippedString.length;
          };

          for (var _iterator = diffResult.entries()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var _ret = _loop();

            if (_ret === "continue") continue;
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

        var deco = DecorationSet.create(editorState.doc, decos);
        return { deco: deco,
          linkedEditor: state.linkedEditor,
          originalEditor: state.originalEditor,
          showAsAdditions: state.showAsAdditions,
          lastDiff: diffResult,
          lastDiffMap: diffMap
        };
      }

      return state;
    }
  },
  props: {
    getData: function getData() {
      console.log('got data!!');
      return 1;
    },
    decorations: function decorations(state) {
      if (state && this.getState(state)) {
        return this.getState(state).deco;
      }
      return null;
    }
  }
});

exports.default = diffPlugin;