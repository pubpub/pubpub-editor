'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _pluginKeys = require('../../schema/plugins/pluginKeys');

var _prosemirrorState = require('prosemirror-state');

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _firebase = require('firebase');

var _firebase2 = _interopRequireDefault(_firebase);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var _require = require('prosemirror-state'),
    Selection = _require.Selection;

var _require2 = require('prosemirror-model'),
    Node = _require2.Node;

var _require3 = require('prosemirror-transform'),
    Step = _require3.Step,
    Mapping = _require3.Mapping;

var _require4 = require('prosemirror-collab'),
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

/*

  How to seperate helper functions from scope?
  Ideally don't want to pass in editorview, state and refs every time.
  could this be refactored into a class with functions?

  Need one manager that takes a firebase ref

*/

/*
  Firebase class, that does what?

  Plugin should be responsible for:
    - maintaining state
    - capturing user actions
    - providing an interface for firebase to act?

  Need to seperate a collaborative document with the rebasing, selections.
  How to create an efficient system of cross-plugin communication besides this get plugin state stuff

  base Plugin state?

*/

/*
  Doesn't need to be a plugin??
*/

/*
  How to create a 'current' merged commit?
  - Always merge current steps?
  - Only show up to last steps?
*/

var _require6 = require('prosemirror-view'),
    DecorationSet = _require6.DecorationSet,
    Decoration = _require6.Decoration;

function stringToColor(string) {
  var alpha = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;

  var hue = string.split('').reduce(function (sum, char) {
    return sum + char.charCodeAt(0);
  }, 0) % 360;
  return 'hsla(' + hue + ', 100%, 50%, ' + alpha + ')';
}

// Checkpoint a document every 100 steps
var SAVE_EVERY_N_STEPS = 100;

// healDatabase - In case a step corrupts the document (happens surpsiginly often), apply each step individually to find errors
// and then delete all of those steps
var healDatabase = function healDatabase(_ref) {
  var changesRef = _ref.changesRef,
      steps = _ref.steps,
      editor = _ref.editor,
      placeholderClientId = _ref.placeholderClientId;

  var stepsToDelete = [];
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = steps[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var step = _step.value;

      try {
        var trans = receiveTransaction(editor.state, step.steps, [placeholderClientId]);
        trans.setMeta('receiveDoc', true);
        editor.dispatch(trans);
      } catch (err) {
        stepsToDelete.push(step.key);
      }
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

  var _iteratorNormalCompletion2 = true;
  var _didIteratorError2 = false;
  var _iteratorError2 = undefined;

  try {
    for (var _iterator2 = stepsToDelete[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
      var _stepsToDelete = _step2.value;

      changesRef.child(_stepsToDelete).remove();
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
};

var getSteps = function getSteps(_ref2) {
  var view = _ref2.view,
      changesRef = _ref2.changesRef,
      key = _ref2.key;


  function compressedStepJSONToStep(compressedStepJSON) {
    return Step.fromJSON(view.state.schema, uncompressStepJSON(compressedStepJSON));
  }

  return new _bluebird2.default(function (resolve, reject) {

    changesRef.startAt(null, String(key + 1)).once('value').then(function (snapshot) {
      var changes = snapshot.val();
      if (!changes) {
        resolve([]);
      }
      var steps = [];
      var keys = Object.keys(changes || {});
      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = keys[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var _key = _step3.value;

          var compressedStepsJSON = changes[_key].s;
          steps.push.apply(steps, _toConsumableArray(compressedStepsJSON.map(compressedStepJSONToStep)));
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

      resolve(steps);
    });
  });
};

var getFirebaseValue = function getFirebaseValue(_ref3) {
  var ref = _ref3.ref,
      child = _ref3.child;

  return new _bluebird2.default(function (resolve, reject) {
    ref.child(child).once('value').then(function (snapshot) {
      resolve(snapshot.val());
    });
  });
};

var setFirebaseValue = function setFirebaseValue(_ref4) {
  var ref = _ref4.ref,
      child = _ref4.child,
      data = _ref4.data;

  return new _bluebird2.default(function (resolve, reject) {
    ref.child(child).set(data, function (error) {
      if (!error) {
        resolve();
      } else {
        reject();
      }
    });
  });
};

var rebaseCommit = function rebaseCommit(_ref5) {
  var commit = _ref5.commit,
      view = _ref5.view,
      doc = _ref5.doc,
      allCommits = _ref5.allCommits,
      newSteps = _ref5.newSteps,
      changesRef = _ref5.changesRef,
      clientID = _ref5.clientID,
      latestKey = _ref5.latestKey,
      selfChanges = _ref5.selfChanges;


  function compressedStepJSONToStep(compressedStepJSON) {
    return Step.fromJSON(view.state.schema, uncompressStepJSON(compressedStepJSON));
  }

  var docMapping = new Mapping();
  var _iteratorNormalCompletion4 = true;
  var _didIteratorError4 = false;
  var _iteratorError4 = undefined;

  try {
    for (var _iterator4 = newSteps[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
      var step = _step4.value;

      docMapping.appendMap(step.getMap());
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

  var tr = view.state.tr;

  var commitSteps = commit.steps;
  var previousSteps = [];

  var _iteratorNormalCompletion5 = true;
  var _didIteratorError5 = false;
  var _iteratorError5 = undefined;

  try {
    for (var _iterator5 = allCommits[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
      var _commit = _step5.value;
      var _iteratorNormalCompletion7 = true;
      var _didIteratorError7 = false;
      var _iteratorError7 = undefined;

      try {
        for (var _iterator7 = Object.values(_commit.steps)[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
          var steps = _step7.value;

          var compressedStepsJSON = steps.s;
          previousSteps.push.apply(previousSteps, _toConsumableArray(compressedStepsJSON.map(compressedStepJSONToStep)));
        }
      } catch (err) {
        _didIteratorError7 = true;
        _iteratorError7 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion7 && _iterator7.return) {
            _iterator7.return();
          }
        } finally {
          if (_didIteratorError7) {
            throw _iteratorError7;
          }
        }
      }
    }
  } catch (err) {
    _didIteratorError5 = true;
    _iteratorError5 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion5 && _iterator5.return) {
        _iterator5.return();
      }
    } finally {
      if (_didIteratorError5) {
        throw _iteratorError5;
      }
    }
  }

  var _iteratorNormalCompletion6 = true;
  var _didIteratorError6 = false;
  var _iteratorError6 = undefined;

  try {
    for (var _iterator6 = previousSteps[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
      var _step8 = _step6.value;

      var invertMap = _step8.getMap().invert();
      docMapping.appendMap(invertMap);
    }
  } catch (err) {
    _didIteratorError6 = true;
    _iteratorError6 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion6 && _iterator6.return) {
        _iterator6.return();
      }
    } finally {
      if (_didIteratorError6) {
        throw _iteratorError6;
      }
    }
  }

  var allCommitSteps = [];
  Object.values(commitSteps).map(function (commitStep) {
    var compressedStepsJSON = commitStep.s;
    allCommitSteps.push.apply(allCommitSteps, _toConsumableArray(compressedStepsJSON.map(compressedStepJSONToStep)));
  });

  var mappedSteps = allCommitSteps.map(function (step) {
    var mappedStep = step.map(docMapping);
    tr = tr.step(mappedStep);
    return mappedStep;
  });

  changesRef.child(latestKey + 1).transaction(function (existingBatchedSteps) {
    if (!existingBatchedSteps) {
      selfChanges[latestKey + 1] = mappedSteps;
      return {
        s: compressStepsLossy(mappedSteps).map(function (step) {
          return compressStepJSON(step.toJSON());
        }),
        c: clientID, // need to store client id in rebase?
        m: { rebasedTransaction: true },
        t: TIMESTAMP
      };
    }
  }, function (error, committed, _ref6) {
    var key = _ref6.key;

    if (error) {
      console.error('updateCollab', error, sendable, key);
    } else if (committed && key % SAVE_EVERY_N_STEPS === 0 && key > 0) {
      var _compressStateJSON = compressStateJSON(newState.toJSON()),
          d = _compressStateJSON.d;

      checkpointRef.set({ d: d, k: key, t: TIMESTAMP });
    }
  }, false);

  tr.setMeta('backdelete', true);
  tr.setMeta('rebase', true);
  view.dispatch(tr);
};

// use forkdoc as a starting point just to be absolutely sure?
var rebaseDocument = function rebaseDocument(_ref7) {
  var view = _ref7.view,
      doc = _ref7.doc,
      forkedSteps = _ref7.forkedSteps,
      newSteps = _ref7.newSteps,
      changesRef = _ref7.changesRef,
      clientID = _ref7.clientID,
      latestKey = _ref7.latestKey,
      selfChanges = _ref7.selfChanges;


  function compressedStepJSONToStep(compressedStepJSON) {
    return Step.fromJSON(view.state.schema, uncompressStepJSON(compressedStepJSON));
  }

  var docMapping = new Mapping();
  var _iteratorNormalCompletion8 = true;
  var _didIteratorError8 = false;
  var _iteratorError8 = undefined;

  try {
    for (var _iterator8 = newSteps[Symbol.iterator](), _step9; !(_iteratorNormalCompletion8 = (_step9 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
      var step = _step9.value;

      docMapping.appendMap(step.getMap());
    }
  } catch (err) {
    _didIteratorError8 = true;
    _iteratorError8 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion8 && _iterator8.return) {
        _iterator8.return();
      }
    } finally {
      if (_didIteratorError8) {
        throw _iteratorError8;
      }
    }
  }

  var tr = view.state.tr;
  var mappedSteps = forkedSteps.map(function (step) {
    var mappedStep = step.map(docMapping);
    tr = tr.step(mappedStep);
    return mappedStep;
  });

  changesRef.child(latestKey + 1).transaction(function (existingBatchedSteps) {
    if (!existingBatchedSteps) {
      selfChanges[latestKey + 1] = mappedSteps;
      return {
        s: compressStepsLossy(mappedSteps).map(function (step) {
          return compressStepJSON(step.toJSON());
        }),
        c: clientID, // need to store client id in rebase?
        m: { rebasedTransaction: true },
        t: TIMESTAMP
      };
    }
  }, function (error, committed, _ref8) {
    var key = _ref8.key;

    if (error) {
      console.error('updateCollab', error, sendable, key);
    } else if (committed && key % SAVE_EVERY_N_STEPS === 0 && key > 0) {
      var _compressStateJSON2 = compressStateJSON(newState.toJSON()),
          d = _compressStateJSON2.d;

      checkpointRef.set({ d: d, k: key, t: TIMESTAMP });
    }
  }, false);

  tr.setMeta('backdelete', true);
  tr.setMeta('rebase', true);
  view.dispatch(tr);
};

var firebaseApp = void 0;

var FirebasePlugin = function FirebasePlugin(_ref9) {
  var selfClientID = _ref9.selfClientID,
      editorKey = _ref9.editorKey,
      firebaseConfig = _ref9.firebaseConfig,
      updateCommits = _ref9.updateCommits,
      pluginKey = _ref9.pluginKey;


  if (!firebaseApp) {
    firebaseApp = _firebase2.default.initializeApp(firebaseConfig);
  }
  var db = _firebase2.default.database(firebaseApp);

  var collabEditing = require('prosemirror-collab').collab;
  var firebaseDb = _firebase2.default.database();
  var firebaseRef = firebaseDb.ref(editorKey);

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
  var editorView = void 0;

  var loadingPromise = _bluebird2.default.defer();

  var loadDocumentAndListen = function loadDocumentAndListen(view) {

    if (fetchedState) {
      return;
    }

    var commitIDRef = firebaseRef.child('currentCommit/commitID');
    var commitsRef = firebaseRef.child('commits');

    if (updateCommits) {
      commitsRef.on('value', function (commitVals) {
        var commits = commitVals.val();
        if (!commits) {
          updateCommits([]);
          return;
        }
        updateCommits(Object.values(commits));
      });
    }

    commitIDRef.on('value', function (commitVal) {
      var newCommitID = commitVal.val();
      var trackPlugin = (0, _pluginKeys.getPlugin)('track', editorView.state);
      if (trackPlugin) {
        trackPlugin.props.updateCommitID.bind(trackPlugin)(newCommitID);
      }
    });

    checkpointRef.once('value').then(function (snapshot) {
      // progress(1 / 2)
      var _ref10 = snapshot.val() || {},
          d = _ref10.d,
          k = _ref10.k;

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

        var _newState = EditorState.create({
          doc: newDoc,
          plugins: view.state.plugins
        });
        view.updateState(_newState);
      }

      return changesRef.startAt(null, String(latestKey + 1)).once('value').then(function (snapshot) {
        // progress(2 / 2)
        // const view = this_.view = constructView({ newDoc, updateCollab, selections })
        var editor = view;

        var changes = snapshot.val();
        if (changes) {
          var steps = [];
          var stepClientIDs = [];
          var placeholderClientId = '_oldClient' + Math.random();
          var _keys = Object.keys(changes);
          var stepsWithKeys = [];
          latestKey = Math.max.apply(Math, _toConsumableArray(_keys));
          var _iteratorNormalCompletion9 = true;
          var _didIteratorError9 = false;
          var _iteratorError9 = undefined;

          try {
            for (var _iterator9 = _keys[Symbol.iterator](), _step10; !(_iteratorNormalCompletion9 = (_step10 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
              var key = _step10.value;

              var compressedStepsJSON = changes[key].s;
              var stepWithKey = { key: key, steps: compressedStepsJSON.map(compressedStepJSONToStep) };
              steps.push.apply(steps, _toConsumableArray(compressedStepsJSON.map(compressedStepJSONToStep)));
              stepsWithKeys.push(stepWithKey);
              stepClientIDs.push.apply(stepClientIDs, _toConsumableArray(new Array(compressedStepsJSON.length).fill(placeholderClientId)));
            }
          } catch (err) {
            _didIteratorError9 = true;
            _iteratorError9 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion9 && _iterator9.return) {
                _iterator9.return();
              }
            } finally {
              if (_didIteratorError9) {
                throw _iteratorError9;
              }
            }
          }

          try {
            var trans = receiveTransaction(editor.state, steps, stepClientIDs);
            trans.setMeta('receiveDoc', true);
            editor.dispatch(trans);
          } catch (err) {
            console.log('healing database!', err);
            healDatabase({ changesRef: changesRef, editor: editor, steps: stepsWithKeys, placeholderClientId: placeholderClientId });
          }
        }

        loadingPromise.resolve();

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
          trans.setMeta('receiveDoc', true);
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

        if (transaction.docChanged) {
          for (var clientID in selections) {
            selections[clientID] = selections[clientID].map(editorState.doc, transaction.mapping);
          }
        }

        if (transaction.getMeta('pointer')) {
          selection = editorState.selection;
          selfSelectionRef.set(compressSelectionJSON(selection.toJSON()));
        }

        return {};
      }
    },

    view: function view(_editorView) {

      editorView = _editorView;
      loadDocumentAndListen(_editorView);
      return {
        update: function update(newView, prevState) {
          editorView = newView;
        },
        destroy: function destroy() {
          editorView = null;
        }
      };
    },

    props: {

      // what to store in 'currentCommit'
      fork: function fork(forkID) {

        var editorRef = firebaseDb.ref(editorKey);
        return new _bluebird2.default(function (resolve, reject) {
          editorRef.once('value', function (snapshot) {
            var forkData = snapshot.val();
            forkData.currentCommit = { commitID: 0 };
            forkData.forkData = {
              merged: false,
              date: new Date(),
              parent: editorKey,
              forkedKey: latestKey
            };
            forkData.changes = [];
            forkData.forks = [];
            forkData.selections = [];

            var _compressStateJSON3 = compressStateJSON(editorView.state.toJSON()),
                d = _compressStateJSON3.d;

            forkData.checkpoint = { d: d, k: 0, t: TIMESTAMP };

            // forkData.forkDoc = compressStateJSON(editorView.state.toJSON());
            firebaseDb.ref(forkID).set(forkData, function (error) {
              if (!error) {
                editorRef.child('forks').child(forkID).set(true);
                resolve(forkID);
              } else {
                reject(error);
              }
            });
          });
        });
      },
      storeRebaseSteps: function storeRebaseSteps(_ref11) {
        var steps = _ref11.steps,
            offsets = _ref11.offsets;

        var editorRef = firebaseDb.ref(editorKey);
        var storedSteps = {
          s: compressStepsLossy(steps).map(function (step) {
            return compressStepJSON(step.toJSON());
          }),
          c: selfClientID,
          m: {},
          t: TIMESTAMP
        };
        editorRef.child('currentCommit/steps').push().set(storedSteps);
        if (offsets) {
          editorRef.child('stepOffsets').push().set(offsets);
        }
      },


      // Take all steps in the current commit and move them into a good one
      commit: function commit(_ref12) {
        var description = _ref12.description,
            uuid = _ref12.uuid,
            steps = _ref12.steps,
            start = _ref12.start,
            end = _ref12.end;

        var editorRef = firebaseDb.ref(editorKey);

        var commitSteps = {
          s: compressStepsLossy(steps).map(function (step) {
            return compressStepJSON(step.toJSON());
          }),
          c: selfClientID,
          m: {},
          t: TIMESTAMP
        };
        return editorRef.child('currentCommit').once('value').then(function (snapshot) {
          var currentCommit = snapshot.val();
          var commitID = currentCommit.commitID;
          var commit = {
            description: description,
            clientID: '',
            steps: [commitSteps],
            uuid: uuid,
            merged: false,
            commitKey: latestKey,
            start: start,
            end: end
          };
          var newCommitID = commitID + 1;
          return editorRef.child('commits/' + commitID).set(commit).then(function () {
            editorRef.child('currentCommit').set({ commitID: newCommitID });

            var _compressStateJSON4 = compressStateJSON(editorView.state.toJSON()),
                d = _compressStateJSON4.d;

            checkpointRef.set({ d: d, k: latestKey, t: TIMESTAMP });
          });
        });
      },


      // return a function that take an index and rebases on it??
      rebaseByCommit: function rebaseByCommit(forkID) {
        var forkRef = firebaseDb.ref(forkID);
        var editorChangesRef = firebaseDb.ref(editorKey).child("changes");

        return _bluebird2.default.all([getFirebaseValue({ ref: forkRef, child: "forkData" }), getFirebaseValue({ ref: forkRef, child: "checkpoint" })]).then(function (_ref13) {
          var _ref14 = _slicedToArray(_ref13, 2),
              forkData = _ref14[0],
              checkpoint = _ref14[1];

          var merged = forkData.merged,
              parent = forkData.parent,
              forkedKey = forkData.forkedKey;
          var d = checkpoint.d;

          var checkpointDoc = uncompressStateJSON({ d: d }).doc;

          return getFirebaseValue({ ref: forkRef, child: "commits" }).then(function (commitVals) {
            var commits = Object.values(commitVals || {});

            // needs to fetch new steps on every commit!
            var rebaseCommitHandler = function rebaseCommitHandler(index) {
              var singleCommit = commits[index];
              var prevCommits = commits.slice(0, index);
              return getSteps({ view: editorView, changesRef: editorChangesRef, key: forkedKey }).then(function (newSteps) {
                rebaseCommit({ commit: singleCommit, allCommits: prevCommits, view: editorView, newSteps: newSteps, changesRef: changesRef, clientID: selfClientID, latestKey: latestKey, selfChanges: selfChanges });
                return setFirebaseValue({ ref: forkRef, child: 'commits/' + index + '/merged', data: true });
              });
            };

            return { rebaseCommitHandler: rebaseCommitHandler, commits: commits, checkpointDoc: checkpointDoc };
          });
        });
      },
      rebase: function rebase(forkID) {
        return loadingPromise.promise.then(function () {
          return new _bluebird2.default(function (resolve, reject) {
            var forkRef = firebaseDb.ref(forkID);
            var forkedChangesRef = firebaseDb.ref(forkID).child("rebaseSteps");
            var editorChangesRef = firebaseDb.ref(editorKey).child("changes");
            var forkedDocRef = firebaseDb.ref(editorKey).child("forks").child(forkID);

            forkRef.child("forkData").once('value').then(function (snapshot) {
              var _snapshot$val2 = snapshot.val(),
                  merged = _snapshot$val2.merged,
                  parent = _snapshot$val2.parent,
                  forkedKey = _snapshot$val2.forkedKey;

              _bluebird2.default.all([getFirebaseValue({ ref: forkRef, child: "forkDoc" }), getSteps({ view: editorView, changesRef: forkedChangesRef, key: null }), getSteps({ view: editorView, changesRef: editorChangesRef, key: forkedKey })]).then(function (_ref15) {
                var _ref16 = _slicedToArray(_ref15, 3),
                    forkDoc = _ref16[0],
                    forkedSteps = _ref16[1],
                    newSteps = _ref16[2];

                return rebaseDocument({ view: editorView, doc: forkDoc, forkedSteps: forkedSteps, newSteps: newSteps, changesRef: changesRef, clientID: selfClientID, latestKey: latestKey, selfChanges: selfChanges });
              }).then(function () {
                return setFirebaseValue({ ref: forkRef, child: "forkData/merged", data: true });
              }).then(function () {
                resolve();
              });
            });
          });
        });
      },
      getForks: function getForks() {
        return loadingPromise.promise.then(function () {
          var forksKey = firebaseDb.ref(editorKey).child("forks");
          return getFirebaseValue({ ref: firebaseDb.ref(editorKey), child: "forks" }).then(function (forkList) {
            if (!forkList) {
              return [];
            }
            var forkNames = Object.keys(forkList);
            var getForkData = forkNames.map(function (forkName) {
              return getFirebaseValue({ ref: firebaseDb.ref(forkName), child: "forkData" }).then(function (forkData) {
                forkData.name = forkName;
                return forkData;
              });
            });
            return _bluebird2.default.all(getForkData);
          });
        });
      },
      updateCollab: function updateCollab(_ref17, newState) {
        var _this = this;

        var docChanged = _ref17.docChanged,
            mapping = _ref17.mapping,
            meta = _ref17.meta;

        // return after meta pointer?
        if (meta.pointer) {
          delete meta.pointer;
        }
        if (meta["collab$"]) {
          return;
        }
        if (meta.rebase) {
          delete meta.rebase;
        }
        if (meta.addToHistory) {
          delete meta.addToHistory;
        }
        var trackPlugin = (0, _pluginKeys.getPlugin)('track', editorView.state);

        var sendable = sendableSteps(newState);

        var updateRebasedSteps = function updateRebasedSteps() {
          var sendableTracks = trackPlugin.getSendableSteps();
          if (sendableTracks) {
            _this.props.storeRebaseSteps(sendableTracks);
          }
        };

        // undo timeout?
        if (trackPlugin) {
          window.setTimeout(updateRebasedSteps, 0);
        }
        if (sendable) {
          var steps = sendable.steps,
              clientID = sendable.clientID;

          changesRef.child(latestKey + 1).transaction(function (existingBatchedSteps) {
            if (!existingBatchedSteps) {
              selfChanges[latestKey + 1] = steps;
              return {
                s: compressStepsLossy(steps).map(function (step) {
                  return compressStepJSON(step.toJSON());
                }),
                c: clientID,
                m: meta,
                t: TIMESTAMP
              };
            }
          }, function (error, committed, _ref18) {
            var key = _ref18.key;

            if (error) {
              console.error('updateCollab', error, sendable, key);
            } else if (committed && key % SAVE_EVERY_N_STEPS === 0 && key > 0) {
              var _compressStateJSON5 = compressStateJSON(newState.toJSON()),
                  d = _compressStateJSON5.d;

              checkpointRef.set({ d: d, k: key, t: TIMESTAMP });
            }
          }, false);
        }

        // each selection changes only on 'pointer' transactions?
      },
      decorations: function decorations(state) {
        return DecorationSet.create(state.doc, Object.entries(selections).map(function (_ref19) {
          var _ref20 = _slicedToArray(_ref19, 2),
              clientID = _ref20[0],
              _ref20$ = _ref20[1],
              from = _ref20$.from,
              to = _ref20$.to;

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
    key: pluginKey
  });
};

exports.default = FirebasePlugin;