'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _require = require('prosemirror-state'),
    Selection = _require.Selection;

var _require2 = require('prosemirror-model'),
    Node = _require2.Node;

var _require3 = require('prosemirror-transform'),
    Step = _require3.Step;

var _require4 = require('prosemirror-collab'),
    collab = _require4.collab,
    sendableSteps = _require4.sendableSteps,
    receiveTransaction = _require4.receiveTransaction;

var _require5 = require('prosemirror-compress'),
    compressStepsLossy = _require5.compressStepsLossy,
    compressStateJSON = _require5.compressStateJSON,
    uncompressStateJSON = _require5.uncompressStateJSON,
    compressSelectionJSON = _require5.compressSelectionJSON,
    uncompressSelectionJSON = _require5.uncompressSelectionJSON,
    compressStepJSON = _require5.compressStepJSON,
    uncompressStepJSON = _require5.uncompressStepJSON;

var TIMESTAMP = { '.sv': 'timestamp' };

var FirebaseEditor = exports.FirebaseEditor = function () {
  function FirebaseEditor(_ref) {
    var firebaseRef = _ref.firebaseRef,
        stateConfig = _ref.stateConfig,
        constructView = _ref.view,
        _ref$clientID = _ref.clientID,
        selfClientID = _ref$clientID === undefined ? firebaseRef.push().key : _ref$clientID,
        _ref$progress = _ref.progress,
        progress = _ref$progress === undefined ? function (_) {
      return _;
    } : _ref$progress;

    _classCallCheck(this, FirebaseEditor);

    progress(0 / 2);
    var this_ = this;
    var checkpointRef = this.checkpointRef = firebaseRef.child('checkpoint');
    var changesRef = this.changesRef = firebaseRef.child('changes');
    var selectionsRef = this.selectionsRef = firebaseRef.child('selections');
    var selfSelectionRef = this.selfSelectionRef = selectionsRef.child(selfClientID);
    selfSelectionRef.onDisconnect().remove();
    var selections = this.selections = {};
    var selfChanges = {};
    var selection = undefined;

    var constructEditor = checkpointRef.once('value').then(function (snapshot) {
      progress(1 / 2);

      var _ref2 = snapshot.val() || {},
          d = _ref2.d,
          _ref2$k = _ref2.k,
          latestKey = _ref2$k === undefined ? -1 : _ref2$k;

      latestKey = Number(latestKey);
      var newDoc = d && Node.fromJSON(stateConfig.schema, uncompressStateJSON({ d: d }).doc);
      // stateConfig.plugins = (stateConfig.plugins || []).concat(collab({ clientID: selfClientID }))

      function compressedStepJSONToStep(compressedStepJSON) {
        return Step.fromJSON(stateConfig.schema, uncompressStepJSON(compressedStepJSON));
      }

      function updateCollab(_ref3, newState) {
        var docChanged = _ref3.docChanged,
            mapping = _ref3.mapping;

        if (docChanged) {
          for (var clientID in selections) {
            selections[clientID] = selections[clientID].map(newState.doc, mapping);
          }
        }
        var sendable = sendableSteps(newState);
        if (sendable) {
          var steps = sendable.steps,
              _clientID = sendable.clientID;

          changesRef.child(latestKey + 1).transaction(function (existingBatchedSteps) {
            if (!existingBatchedSteps) {
              selfChanges[latestKey + 1] = steps;
              return {
                s: compressStepsLossy(steps).map(function (step) {
                  return compressStepJSON(step.toJSON());
                }),
                c: _clientID,
                t: TIMESTAMP
              };
            }
          }, function (error, committed, _ref4) {
            var key = _ref4.key;

            if (error) {
              console.error('updateCollab', error, sendable, key);
            } else if (committed && key % 100 === 0 && key > 0) {
              var _compressStateJSON = compressStateJSON(newState.toJSON()),
                  _d = _compressStateJSON.d;

              checkpointRef.set({ d: _d, k: key, t: TIMESTAMP });
            }
          }, false);
        }

        var selectionChanged = !newState.selection.eq(selection);
        if (selectionChanged) {
          selection = newState.selection;
          selfSelectionRef.set(compressSelectionJSON(selection.toJSON()));
        }
      }

      return changesRef.startAt(null, String(latestKey + 1)).once('value').then(function (snapshot) {
        progress(2 / 2);
        var view = this_.view = constructView({ newDoc: newDoc, updateCollab: updateCollab, selections: selections });
        var editor = view.editor || view;

        var changes = snapshot.val();
        if (changes) {
          var steps = [];
          var stepClientIDs = [];
          var placeholderClientId = '_oldClient' + Math.random();
          var keys = Object.keys(changes);
          latestKey = Math.max.apply(Math, _toConsumableArray(keys));
          var _iteratorNormalCompletion = true;
          var _didIteratorError = false;
          var _iteratorError = undefined;

          try {
            for (var _iterator = keys[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
              var key = _step.value;

              var compressedStepsJSON = changes[key].s;
              steps.push.apply(steps, _toConsumableArray(compressedStepsJSON.map(compressedStepJSONToStep)));
              stepClientIDs.push.apply(stepClientIDs, _toConsumableArray(new Array(compressedStepsJSON.length).fill(placeholderClientId)));
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

          editor.dispatch(receiveTransaction(editor.state, steps, stepClientIDs));
        }

        function updateClientSelection(snapshot) {
          var clientID = snapshot.key;
          if (clientID !== selfClientID) {
            var compressedSelection = snapshot.val();
            if (compressedSelection) {
              try {
                selections[clientID] = Selection.fromJSON(editor.state.doc, uncompressSelectionJSON(compressedSelection));
              } catch (error) {
                console.warn('updateClientSelection', error);
              }
            } else {
              delete selections[clientID];
            }
            editor.dispatch(editor.state.tr);
          }
        }
        selectionsRef.on('child_added', updateClientSelection);
        selectionsRef.on('child_changed', updateClientSelection);
        selectionsRef.on('child_removed', updateClientSelection);

        changesRef.startAt(null, String(latestKey + 1)).on('child_added', function (snapshot) {
          latestKey = Number(snapshot.key);

          var _snapshot$val = snapshot.val(),
              compressedStepsJSON = _snapshot$val.s,
              clientID = _snapshot$val.c;

          var steps = clientID === selfClientID ? selfChanges[latestKey] : compressedStepsJSON.map(compressedStepJSONToStep);
          var stepClientIDs = new Array(steps.length).fill(clientID);
          editor.dispatch(receiveTransaction(editor.state, steps, stepClientIDs));
          delete selfChanges[latestKey];
        });

        return Object.assign({
          destroy: this_.destroy.bind(this_)
        }, this_);
      });
    });

    Object.defineProperties(this, {
      then: { value: constructEditor.then.bind(constructEditor) },
      catch: { value: constructEditor.catch.bind(constructEditor) }
    });
  }

  _createClass(FirebaseEditor, [{
    key: 'destroy',
    value: function destroy() {
      var _this = this;

      this.catch(function (_) {
        return _;
      }).then(function () {
        _this.changesRef.off();
        _this.selectionsRef.off();
        _this.selfSelectionRef.off();
        _this.selfSelectionRef.remove();
        _this.view.destroy();
      });
    }
  }]);

  return FirebaseEditor;
}();