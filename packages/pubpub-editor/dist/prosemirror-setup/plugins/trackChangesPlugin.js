'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _prosemirrorTransform = require('prosemirror-transform');

var _prosemirrorView = require('prosemirror-view');

var _prosemirrorModel = require('prosemirror-model');

var _prosemirrorState = require('prosemirror-state');

var _pluginKeys = require('./pluginKeys');

var _schema = require('../schema');

var _require = require('prosemirror-state'),
    Selection = _require.Selection;

var _require2 = require('prosemirror-model'),
    Node = _require2.Node;

var _require3 = require('prosemirror-transform'),
    Step = _require3.Step,
    findWrapping = _require3.findWrapping,
    Mapping = _require3.Mapping;

/*
const createReference = (citationData, state, engine) => {
	const citationID = citationData.id;
	const newNode = schema.nodes.citation.create({data: citationData, citationID });
	const citationsNode = findNodesWithIndex(state.doc, 'citations');
	const pos = citationsNode[0].index + 1;

	// tries to find the closest place to insert this note
	const newPoint = insertPoint(state.doc, pos, schema.nodes.citation, {data: citationData});
	let tr = state.tr.insert(newPoint, newNode);
	tr.setMeta('createdReference', citationID);
	engine.addCitation(citationData);
	return tr;
}


const trackPlugin = new Plugin({
  state: {
    init(_, instance) {
      return new TrackState([new Span(0, instance.doc.content.size, null)], [], [], [])
    },
    applyAction(action, tracked, previousState, newState) {
      if (action.type == "transform")
        return tracked.applyTransform(action.transform)
      if (action.type == "commit")
        return tracked.applyCommit(action.message, action.time)
      else
        return tracked
    }
  }
});
*/

var storedSteps = [];
var docMap = new Mapping();
var initialState = null;

// need to store an array of steps that recreate the original document
// need to store mappings that remove additions


var trackChangesPlugin = new _prosemirrorState.Plugin({
  state: {
    init: function init(config, instance) {
      console.log(instance.doc);
      initialState = instance;
      return {
        deco: _prosemirrorView.DecorationSet.empty, commit: null
      };
    },
    apply: function apply(transaction, state, prevEditorState, editorState) {

      return state;

      /*
      if (action.type == "highlightCommit") {
        let tState = trackPlugin.getState(state);
        const editingCommit = tState.commits.length;
        let decos = tState.blameMap
            .filter(span => span.commit !== null)
            .map(span => {
              let decorationClass = `blame-marker commit-id-${span.commit}`;
              if (span.commit !== action.commit) {
                decorationClass += ' invisible';
              } else {
                decorationClass += ' highlight';
              }
              if (span.commit === editingCommit) {
                decorationClass += ' editing';
              }
              return Decoration.inline(span.from, span.to, {class: decorationClass}, {inclusiveLeft: true, inclusiveRight: true});
            })
        return {deco: DecorationSet.create(state.doc, decos), commit: action.commit}
      }
      else
      */

      /*
      if (action.type == "transform" && prev.commit) {
        console.log('got previous committt');
        return {deco: prev.deco.map(action.transform.mapping, action.transform.doc), commit: prev.commit}
      }
      else if (action.type === 'commit' || action.type === 'transform' || action.type === 'clearHighlight') {
        let tState = trackPlugin.getState(state)
        const editingCommit = tState.commits.length;
        let decos = tState.blameMap
            .filter(span => span.commit !== null)
            .map(span => {
              let decorationClass = `blame-marker commit-id-${span.commit}`;
              if (span.commit === editingCommit) {
                decorationClass += ' editing';
              }
              return Decoration.inline(span.from, span.to, {class: decorationClass}, {inclusiveLeft: true, inclusiveRight: true});
            })
        return {deco: DecorationSet.create(state.doc, decos), commit: action.commit};
      }
      return val;
      */

      /*
      if (action.type == "highlightCommit" && prev.commit != action.commit) {
        let tState = trackPlugin.getState(state)
        let decos = tState.blameMap
            .filter(span => tState.commits[span.commit] == action.commit)
            .map(span => Decoration.inline(span.from, span.to, {class: "blame-marker"}))
        return {deco: DecorationSet.create(state.doc, decos), commit: action.commit}
      } else if (action.type == "clearHighlight" && prev.commit == action.commit) {
        return {deco: DecorationSet.empty, commit: null}
      } else if (action.type == "transform" && prev.commit) {
        return {deco: prev.deco.map(action.transform.mapping, action.transform.doc), commit: prev.commit}
      } else {
        return prev
      }
      */
    }
  },

  // need to prevent backspace button
  appendTransaction: function appendTransaction(transactions, oldState, newState) {
    var firstTransaction = transactions[0];
    if (!firstTransaction) {
      console.log('appending pls');
      return;
    }
    var transaction = firstTransaction;
    //   debugger;
    if (transaction.getMeta("backdelete") || transaction.getMeta('history$')) {
      return;
    }

    console.log(transaction);

    if (transaction.mapping && transaction.mapping.maps.length > 0) {
      var sel = newState.selection;
      var pos = sel.$from;

      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = transaction.steps[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var _step3 = _step.value;

          var mappedStep = _step3.map(docMap);
          storedSteps.push(mappedStep);
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

      if (!pos.parent || !pos.parent.nodeType || pos.parent.nodeType.name !== 'diff') {
        var _ret = function () {

          var tr = newState.tr;

          var mappings = transaction.mapping.maps;

          var _iteratorNormalCompletion2 = true;
          var _didIteratorError2 = false;
          var _iteratorError2 = undefined;

          try {
            var _loop = function _loop() {
              var step = _step2.value;

              var map = step.getMap();

              if (step instanceof _prosemirrorTransform.AddMarkStep) {
                tr = tr.addMark(step.from, step.to, _schema.schema.mark('diff_plus', {}));
                return 'continue';
              }

              var slice = step.slice.content;

              if (slice.size === 0) {
                return 'continue';
              }

              map.forEach(function (oldStart, oldEnd, newStart, newEnd) {

                if (oldStart !== oldEnd) {
                  var inverse = step.invert(oldState.doc);
                  tr = tr.step(inverse);
                  var _slice = step.slice.content;
                  var possibleInsert = tr.mapping.map(newEnd, 1);
                  // const newMapping = tr.mapping.map(possibleInsert - 1));
                  var insertstep = (0, _prosemirrorTransform.replaceStep)(tr.doc, possibleInsert, possibleInsert, step.slice);
                  /*
                  const inverseInsert = insertstep.invert(tr.doc);
                  console.log('INVERSE STEP', inverseInsert);
                  */
                  // docMap.appendMap(inverseInsert.getMap());
                  tr = tr.step(insertstep);
                  console.log(inverse.slice.content);
                  console.log(tr.mapping.map(possibleInsert, 1));
                  console.log(tr.mapping.map(possibleInsert + 1, 1));
                  // const deleteStep = replaceStep(tr.doc, possibleInsert,possibleInsert, step.slice);

                  // tr = tr.insert(possibleInsert, slice);
                  var insertStart = tr.mapping.map(newEnd, -1);
                  var insertEnd = tr.mapping.map(newEnd, 1);
                  // need to check actual changes?

                  tr = tr.addMark(oldStart, oldEnd, _schema.schema.mark('diff_minus', {}));
                  tr = tr.addMark(insertStart, insertEnd, _schema.schema.mark('diff_plus', {}));

                  // Should it be

                  // need to loop through and delete stuff
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
                } else {

                  //c tr.addStoredMark(schema.mark('diff_plus', {}));
                  tr = tr.addMark(newStart, newEnd, _schema.schema.mark('diff_plus', {}));
                  /*
                  const range = new NodeRange(tr.doc.resolve(newStart), tr.doc.resolve(newEnd), tr.doc.resolve(newStart).depth);
                  const wrappings = findWrapping(range, schema.nodes.diff, {});
                  tr = tr.wrap(range, wrappings);
                  */
                }

                /*
                const range = new NodeRange(tr.doc.resolve(newStart), tr.doc.resolve(newEnd), tr.doc.resolve(newStart).depth);
                const wrappings = findWrapping(range, schema.nodes.diff, {});
                tr = tr.wrap(range, wrappings);
                if (oldStart !== oldEnd) {
                  // const inverse = step.invert(oldState.doc);
                  // const slice = inverse.slice.content;
                  const slice = oldState.doc.slice(oldStart, oldEnd).content;
                  const possibleInsert = tr.mapping.map(newStart, -1);
                  // const actualInsert = insertPoint(tr.doc, possibleInsert)
                  // console.log(possibleInsert, newEnd, slice);
                  tr = tr.insert(possibleInsert, slice);
                   console.log(canJoin(tr.doc, possibleInsert));
                  console.log(canJoin(tr.doc, tr.mapping.map(possibleInsert - 1)));
                  console.log(joinPoint(tr.doc, tr.mapping.map(possibleInsert - 1)));
                   //tr = tr.join(tr.mapping.map(possibleInsert + 1));
                  tr.setMeta("backdelete", true);
                }
                */
              });
            };

            for (var _iterator2 = transaction.steps[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
              var _ret2 = _loop();

              if (_ret2 === 'continue') continue;
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

          return {
            v: tr
          };
          /*
          for (const mapping of transaction.transaction.mapping) {
            mapping.forEach((oldStart, oldEnd, newStart, newEnd) => {
             });
          }
           wrap(range: NodeRange, wrappers: [{type: NodeType, attrs: ?Object}]) → this
           let tr = newState.tr.insert(newPoint, newNode);
          tr.setMeta('createdReference', citationID);
          */
        }();

        if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
      }
      return null;
    }
    return null;
  },
  view: function view(editorView) {
    var _this = this;

    this.editorView = editorView;
    return {
      update: function update(newView, prevState) {
        _this.editorView = newView;
      },
      destroy: function destroy() {
        _this.editorView = null;
      }
    };
  },
  key: _pluginKeys.keys.track,
  props: {
    resetView: function resetView(view) {
      view.updateState(initialState);
      var tr = view.state.tr;
      var hasMapped = false;
      var stepMap = new Mapping();
      console.log(docMap);
      stepMap.appendMapping(docMap);
      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = storedSteps[Symbol.iterator](), _step4; !(_iteratorNormalCompletion3 = (_step4 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var _step5 = _step4.value;

          //   let passStep = step.map(stepMap);
          var mappedStep = _step5.map(docMap);
          console.log('applying step', _step5, mappedStep);

          tr = tr.step(mappedStep);
          // stepMap.appendMap(step.getMap());
          // tr.setMeta('backdelete', true);
          //view.dispatch(tr);
          // tr = view.state.tr;
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

      console.log('got stored!', storedSteps);
      tr.setMeta('backdelete', true);
      view.dispatch(tr);
    },
    handleKeyDown: function handleKeyDown(view, event) {
      if (event.code === 'Backspace') {

        var sel = view.state.selection;
        var pos = sel.$from;
        var tr = view.state.tr;
        // const beforePos = view.state.doc.resolve(pos.before(pos.depth + 1));
        var beforeSel = Selection.findFrom(view.state.doc.resolve(sel.from - 1), -1, true);
        // tr.setSelection(Selection.near(tr.doc.resolve(selPos), 1));
        // view.dispatch(tr);
        // return true;

        // does it have to be a node wrapper?

        var marks = beforeSel.$from.marks();

        var hasDiff = marks.find(function (mark) {
          return mark.type.name === 'diff_plus';
        });

        if (hasDiff) {
          return false;
        }

        tr = tr.addMark(beforeSel.from, sel.from, _schema.schema.mark('diff_minus', {}));
        tr = tr.setSelection(beforeSel);

        /*
        const range = new NodeRange(beforeSel.$from, pos, pos.depth);
        const wrappings = findWrapping(range, schema.nodes.diff, {type: 'minus'});
         tr = tr.wrap(range, wrappings);
        tr = tr.setSelection(beforeSel);
        */
        tr.setMeta('backdelete', true);
        view.dispatch(tr);

        return true;
      }
    }

  }
});

exports.default = trackChangesPlugin;