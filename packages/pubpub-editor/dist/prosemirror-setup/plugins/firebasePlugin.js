'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _prosemirrorState = require('prosemirror-state');

var _prosemirrorModel = require('prosemirror-model');

var _firebase = require('firebase');

var _firebase2 = _interopRequireDefault(_firebase);

var _prosemirrorTransform = require('prosemirror-transform');

var _pluginKeys = require('./pluginKeys');

var _schema = require('../schema');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

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

var _require6 = require('prosemirror-view'),
    DecorationSet = _require6.DecorationSet,
    Decoration = _require6.Decoration;

var firebaseConfig = {
  apiKey: "AIzaSyBpE1sz_-JqtcIm2P4bw4aoMEzwGITfk0U",
  authDomain: "pubpub-rich.firebaseapp.com",
  databaseURL: "https://pubpub-rich.firebaseio.com",
  projectId: "pubpub-rich",
  storageBucket: "pubpub-rich.appspot.com",
  messagingSenderId: "543714905893"
};
var firebaseApp = _firebase2.default.initializeApp(firebaseConfig);
var db = _firebase2.default.database(firebaseApp);

function stringToColor(string) {
  var alpha = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;

  var hue = string.split('').reduce(function (sum, char) {
    return sum + char.charCodeAt(0);
  }, 0) % 360;
  return 'hsla(' + hue + ', 100%, 50%, ' + alpha + ')';
}

// how to


var FirebasePlugin = function FirebasePlugin(_ref) {
  var selfClientID = _ref.selfClientID;


  console.log('creating firebase plugin!!', selfClientID);

  var collabEditing = require('prosemirror-collab').collab;
  var firebaseRef = _firebase2.default.database().ref("testEditor");

  var checkpointRef = firebaseRef.child('checkpoint');
  var changesRef = firebaseRef.child('changes');
  var selectionsRef = firebaseRef.child('selections');
  var selfSelectionRef = selectionsRef.child(selfClientID);
  selfSelectionRef.onDisconnect().remove();
  var selections = {};
  var selfChanges = {};
  var selection = undefined;
  var fetchedState = false;
  var latestKey = void 0;
  var selectionMarkers = {};

  var loadDocumentAndListen = function loadDocumentAndListen(view) {

    console.log('loading document!');
    console.log(view);
    if (fetchedState) {
      return;
    }

    checkpointRef.once('value').then(function (snapshot) {
      // progress(1 / 2)
      var _ref2 = snapshot.val() || {},
          d = _ref2.d,
          k = _ref2.k;

      latestKey = k ? k : -1;
      latestKey = Number(latestKey);
      var newDoc = d && Node.fromJSON(view.state.schema, uncompressStateJSON({ d: d }).doc);

      function compressedStepJSONToStep(compressedStepJSON) {
        return Step.fromJSON(view.state.schema, uncompressStepJSON(compressedStepJSON));
      }

      fetchedState = true;

      if (newDoc) {
        var _require7 = require('prosemirror-state'),
            EditorState = _require7.EditorState;

        var newState = EditorState.create({
          doc: newDoc,
          plugins: view.state.plugins
        });
        view.updateState(newState);
      }

      return changesRef.startAt(null, String(latestKey + 1)).once('value').then(function (snapshot) {
        // progress(2 / 2)
        // const view = this_.view = constructView({ newDoc, updateCollab, selections })
        var editor = view;
        console.log('got editor change!', view);

        var changes = snapshot.val();
        if (changes) {
          var steps = [];
          var stepClientIDs = [];
          var placeholderClientId = '_oldClient' + Math.random();
          var _keys = Object.keys(changes);
          latestKey = Math.max.apply(Math, _toConsumableArray(_keys));
          var _iteratorNormalCompletion = true;
          var _didIteratorError = false;
          var _iteratorError = undefined;

          try {
            for (var _iterator = _keys[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
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
              clientID = _snapshot$val.c,
              meta = _snapshot$val.m;

          var steps = clientID === selfClientID ? selfChanges[latestKey] : compressedStepsJSON.map(compressedStepJSONToStep);
          var stepClientIDs = new Array(steps.length).fill(clientID);
          var trans = receiveTransaction(editor.state, steps, stepClientIDs);
          if (meta) {
            for (var metaKey in meta) {
              trans.setMeta(metaKey, meta[metaKey]);
            }
          }
          editor.dispatch(trans);
          delete selfChanges[latestKey];
        });

        /*
        return Object.assign({
          destroy: this_.destroy.bind(this_),
        }, this_);
        */
      });
    });
  };

  return new _prosemirrorState.Plugin({
    state: {
      init: function init(config, instance) {

        return {};
      },
      apply: function apply(transaction, state, prevEditorState, editorState) {
        return {};
      }
    },

    view: function view(editorView) {
      var _this = this;

      this.editorView = editorView;
      loadDocumentAndListen(editorView);
      return {
        update: function update(newView, prevState) {
          _this.editorView = newView;
        },
        destroy: function destroy() {
          _this.editorView = null;
        }
      };
    },

    props: {
      updateCollab: function updateCollab(_ref3, newState) {
        var docChanged = _ref3.docChanged,
            mapping = _ref3.mapping,
            meta = _ref3.meta;

        if (docChanged) {
          for (var clientID in selections) {
            selections[clientID] = selections[clientID].map(newState.doc, mapping);
          }
        }

        // return after meta pointer?
        if (meta.pointer) {
          delete meta.pointer;
        }
        if (meta["collab$"]) {
          return;
          delete meta["collab$"];
        }
        if (meta.rebase) {
          delete meta.rebase;
        }
        if (meta.addToHistory) {
          delete meta.addToHistory;
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
                m: meta,
                t: TIMESTAMP
              };
            }
          }, function (error, committed, _ref4) {
            var key = _ref4.key;

            if (error) {
              console.error('updateCollab', error, sendable, key);
            } else if (committed && key % 100 === 0 && key > 0) {
              var _compressStateJSON = compressStateJSON(newState.toJSON()),
                  d = _compressStateJSON.d;

              checkpointRef.set({ d: d, k: key, t: TIMESTAMP });
            }
          }, false);
        }

        var selectionChanged = !newState.selection.eq(selection);
        if (selectionChanged) {
          selection = newState.selection;
          selfSelectionRef.set(compressSelectionJSON(selection.toJSON()));
        }
      },
      decorations: function decorations(state) {
        return DecorationSet.create(state.doc, Object.entries(selections).map(function (_ref5) {
          var _ref6 = _slicedToArray(_ref5, 2),
              clientID = _ref6[0],
              _ref6$ = _ref6[1],
              from = _ref6$.from,
              to = _ref6$.to;

          console.log(clientID, selfClientID);
          if (clientID === selfClientID) {
            return null;
          }
          if (from === to) {
            var elem = document.createElement('span');
            elem.className = "collab-cursor";
            elem.style.borderLeft = '1px solid ' + stringToColor(clientID);
            return Decoration.widget(from, elem);
          } else {
            return Decoration.inline(from, to, {
              style: 'background-color: ' + stringToColor(clientID, 0.2) + ';'
            });
          }
        }));
      }
    },
    key: _pluginKeys.keys.firebase
  });
};

exports.default = FirebasePlugin;