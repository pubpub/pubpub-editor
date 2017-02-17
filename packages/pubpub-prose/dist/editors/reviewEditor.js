'use strict';

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _richEditor = require('./richEditor');

var _prosemirrorState = require('prosemirror-state');

var _schema = require('../schema');

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _require = require("prosemirror-view"),
    Decoration = _require.Decoration,
    DecorationSet = _require.DecorationSet;

var _require2 = require("prosemirror-transform"),
    Mapping = _require2.Mapping;

var trackPlugin = new _prosemirrorState.Plugin({
  state: {
    init: function init(_, instance) {
      return new TrackState([new Span(0, instance.doc.content.size, null)], [], [], []);
    },
    applyAction: function applyAction(action, tracked, previousState, newState) {
      if (action.type == "transform") return tracked.applyTransform(action.transform);
      if (action.type == "commit") return tracked.applyCommit(action.message, action.time);else return tracked;
    }
  }
});

// Add class to number review
// positionally anchor elements
var highlightPlugin = new _prosemirrorState.Plugin({
  state: {
    init: function init() {
      return { deco: DecorationSet.empty, commit: null };
    },
    applyAction: function applyAction(action, val, prev, state) {

      if (action.type == "highlightCommit") {
        var _ret = function () {
          var tState = trackPlugin.getState(state);
          var editingCommit = tState.commits.length;
          var decos = tState.blameMap.filter(function (span) {
            return span.commit !== null;
          }).map(function (span) {
            var decorationClass = 'blame-marker commit-id-' + span.commit;
            if (span.commit !== action.commit) {
              decorationClass += ' invisible';
            } else {
              decorationClass += ' highlight';
            }
            if (span.commit === editingCommit) {
              decorationClass += ' editing';
            }
            return Decoration.inline(span.from, span.to, { class: decorationClass }, { inclusiveLeft: true, inclusiveRight: true });
          });
          return {
            v: { deco: DecorationSet.create(state.doc, decos), commit: action.commit }
          };
        }();

        if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
      } else if (action.type == "transform" && prev.commit) {
        console.log('got previous committt');
        return { deco: prev.deco.map(action.transform.mapping, action.transform.doc), commit: prev.commit };
      } else if (action.type === 'commit' || action.type === 'transform' || action.type === 'clearHighlight') {
        var _ret2 = function () {
          var tState = trackPlugin.getState(state);
          var editingCommit = tState.commits.length;
          var decos = tState.blameMap.filter(function (span) {
            return span.commit !== null;
          }).map(function (span) {
            var decorationClass = 'blame-marker commit-id-' + span.commit;
            if (span.commit === editingCommit) {
              decorationClass += ' editing';
            }
            return Decoration.inline(span.from, span.to, { class: decorationClass }, { inclusiveLeft: true, inclusiveRight: true });
          });
          return {
            v: { deco: DecorationSet.create(state.doc, decos), commit: action.commit }
          };
        }();

        if ((typeof _ret2 === 'undefined' ? 'undefined' : _typeof(_ret2)) === "object") return _ret2.v;
      }
      return val;

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
  props: {
    decorations: function decorations(state) {
      if (state && this.getState(state)) {
        return this.getState(state).deco;
      }
      return null;
    },
    handleTextInput: function handleTextInput(view, from, to, text) {
      // console.log('got text!', arguments);
      var _require3 = require('prosemirror-transform'),
          Transform = _require3.Transform;

      if (from !== to) {
        var doc = view.state.doc;
        var textNode = _schema.schema.text(text);
        var newT = view.state.tr.replaceWith(to, to, textNode);
        var action = {
          type: 'transform',
          transform: newT
        };
        var markDeleteAction = {
          type: 'markDelete',
          to: to,
          from: from
        };
        view.props.onAction(action);
        view.props.onAction(markDeleteAction);
        return true;
      }
    }
  }
});

var Span = function Span(from, to, commit) {
  _classCallCheck(this, Span);

  this.from = from;this.to = to;this.commit = commit;
};

var Commit = function Commit(message, time, steps, maps, hidden, id) {
  _classCallCheck(this, Commit);

  this.message = message;
  this.time = time;
  this.steps = steps;
  this.maps = maps;
  this.hidden = hidden;
  this.id = id;
  this.unsaved = false;
};

var UnsavedCommit = function (_Commit) {
  _inherits(UnsavedCommit, _Commit);

  function UnsavedCommit(id) {
    _classCallCheck(this, UnsavedCommit);

    var _this = _possibleConstructorReturn(this, (UnsavedCommit.__proto__ || Object.getPrototypeOf(UnsavedCommit)).call(this, '', new Date(), [], [], false, id));

    _this.unsaved = true;
    return _this;
  }

  return UnsavedCommit;
}(Commit);

var TrackState = function () {
  function TrackState(blameMap, commits, uncommittedSteps, uncommittedMaps) {
    _classCallCheck(this, TrackState);

    this.blameMap = blameMap;
    this.commits = commits;
    this.uncommittedSteps = uncommittedSteps;
    this.uncommittedMaps = uncommittedMaps;
  }

  _createClass(TrackState, [{
    key: 'applyTransform',
    value: function applyTransform(transform) {
      // console.log(transform);
      console.log(transform.steps);
      var inverted = transform.steps.map(function (step, i) {
        return step.invert(transform.docs[i]);
      });
      var newBlameMap = updateBlameMap(this.blameMap, transform, this.commits.length);
      return new TrackState(newBlameMap, this.commits, this.uncommittedSteps.concat(inverted), this.uncommittedMaps.concat(transform.mapping.maps));
    }
  }, {
    key: 'applyCommit',
    value: function applyCommit(message, time) {
      if (this.uncommittedSteps.length == 0) return this;
      var commit = new Commit(message, time, this.uncommittedSteps, this.uncommittedMaps, false, this.commits.length);
      return new TrackState(this.blameMap, this.commits.concat(commit), [], []);
    }
  }]);

  return TrackState;
}();

function updateBlameMap(map, transform, id) {
  // for each existing part of the blame map
  // take the to and from and map it through the transforms mapping
  // if the from is less than the to, then the step still exists and you push it to the span
  var result = [],
      mapping = transform.mapping;
  for (var i = 0; i < map.length; i++) {
    var span = map[i];
    var from = mapping.map(span.from, 1),
        to = mapping.map(span.to, -1);
    if (from < to) result.push(new Span(from, to, span.commit));
  }

  // take each new step and insert it into the blame

  var _loop = function _loop(_i) {
    var map = mapping.maps[_i],
        after = mapping.slice(_i + 1);
    map.forEach(function (_s, _e, start, end) {
      insertIntoBlameMap(result, after.map(start, 1), after.map(end, -1), id);
    });
  };

  for (var _i = 0; _i < mapping.maps.length; _i++) {
    _loop(_i);
  }

  return result;
}

function insertIntoBlameMap(map, from, to, commit) {
  if (from >= to) return;
  var pos = 0,
      next = void 0;
  for (; pos < map.length; pos++) {
    next = map[pos];
    if (next.commit == commit) {
      if (next.to >= from) break;
    } else if (next.to > from) {
      // Different commit, not before
      if (next.from < from) {
        // Sticks out to the left (loop below will handle right side)
        var left = new Span(next.from, from, next.commit);
        if (next.to > to) map.splice(pos++, 0, left);else map[pos++] = left;
      }
      break;
    }
  }

  while (next = map[pos]) {
    if (next.commit == commit) {
      if (next.from > to) break;
      from = Math.min(from, next.from);
      to = Math.max(to, next.to);
      map.splice(pos, 1);
    } else {
      if (next.from >= to) break;
      if (next.to > to) {
        map[pos] = new Span(to, next.to, next.commit);
        break;
      } else {
        map.splice(pos, 1);
      }
    }
  }

  map.splice(pos, 0, new Span(from, to, commit));
}

var lastRendered = null;

function revertCommit(commitId, state) {
  var tState = trackPlugin.getState(state);
  var found = tState.commits[commitId];
  if (!found) return;
  var commit = found;
  var actions = [];

  if (tState.uncommittedSteps.length) return alert("Commit your changes first!");

  var remap = new Mapping(tState.commits.slice(found).reduce(function (maps, c) {
    return maps.concat(c.maps);
  }, []));
  var tr = state.tr;
  for (var i = commit.steps.length - 1; i >= 0; i--) {
    var remapped = commit.steps[i].map(remap.slice(i + 1));
    var result = remapped && tr.maybeStep(remapped);
    if (result && result.doc) remap.appendMap(remapped.getMap(), i);
  }
  if (tr.steps.length) {
    console.log('removing action', tr.steps);
    actions.push(tr.action());
    // actions.push(commitAction(`Revert '${commit.message}'`));
  } else {
    console.log('could not revert!');
  }
  return actions;
}

function findInBlameMap(pos, state) {
  var map = trackPlugin.getState(state).blameMap;
  for (var i = 0; i < map.length; i++) {
    if (map[i].to >= pos && map[i].commit != null) return map[i].commit;
  }
}

/*
document.querySelector("#blame").addEventListener("mousedown", e => {
  e.preventDefault()
  let pos = e.target.getBoundingClientRect()
  let commitID = findInBlameMap(state.selection.head, state)
  let commit = commitID != null && trackPlugin.getState(state).commits[commitID]
  let node = crel("div", {class: "blame-info"},
                  commitID != null ? ["It was: ", crel("strong", null, commit ? commit.message : "Uncommitted")]
                  : "No commit found")
  node.style.right = (document.body.clientWidth - pos.right) + "px"
  node.style.top = (pos.bottom + 2) + "px"
  document.body.appendChild(node)
  setTimeout(() => document.body.removeChild(node), 2000)
})
*/

var ReviewEditor = function (_AbstractEditor) {
  _inherits(ReviewEditor, _AbstractEditor);

  function ReviewEditor(_ref) {
    var place = _ref.place,
        text = _ref.text,
        contents = _ref.contents,
        otherEditor = _ref.otherEditor,
        renderCommits = _ref.renderCommits;

    _classCallCheck(this, ReviewEditor);

    var _this2 = _possibleConstructorReturn(this, (ReviewEditor.__proto__ || Object.getPrototypeOf(ReviewEditor)).call(this));

    _this2.createCommit = function (msg) {
      var commitAction = { type: "commit", message: msg, time: new Date() };
      _this2._onAction(commitAction);
    };

    _this2.highlightCommit = function (commitId) {
      var commitAction = { type: "highlightCommit", commit: commitId };
      _this2._onAction(commitAction);
    };

    _this2.clearHighlight = function (commitId) {
      var commitAction = { type: "clearHighlight", commit: commitId };
      _this2._onAction(commitAction);
    };

    _this2.revertCommit = function (commitId) {
      var actions = revertCommit(commitId, _this2.view.state);
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = actions[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var action = _step.value;

          _this2._onAction(action);
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
    };

    _this2._onAction = _this2._onAction.bind(_this2);
    _this2.otherEditor = otherEditor;
    _this2.renderCommits = renderCommits;
    _this2.trackPlugin = trackPlugin;
    _this2.highlightPlugin = highlightPlugin;

    var _require4 = require('../pubpubSetup'),
        pubpubSetup = _require4.pubpubSetup;

    var _require5 = require("../markdownParser"),
        markdownParser = _require5.markdownParser;

    var plugins = pubpubSetup({ schema: _schema.schema });
    var docJSON = void 0;
    if (text) {
      docJSON = markdownParser.parse(text).toJSON();
    } else {
      docJSON = contents;
    }
    _this2.create({ place: place, contents: docJSON, plugins: plugins });
    return _this2;
  }

  _createClass(ReviewEditor, [{
    key: 'create',
    value: function create(_ref2) {
      var place = _ref2.place,
          contents = _ref2.contents,
          plugins = _ref2.plugins;


      var diffPlugins = plugins.concat(trackPlugin, highlightPlugin);
      _get(ReviewEditor.prototype.__proto__ || Object.getPrototypeOf(ReviewEditor.prototype), 'create', this).call(this, { place: place, contents: contents, plugins: diffPlugins });
    }
  }, {
    key: '_onAction',
    value: function _onAction(action) {
      _get(ReviewEditor.prototype.__proto__ || Object.getPrototypeOf(ReviewEditor.prototype), '_onAction', this).call(this, action);
      var state = this.view.state;
      var curState = this.trackPlugin.getState(state);
      var commits = curState.commits.slice(0);
      var editingId = null;
      if (curState.uncommittedSteps.length > 0) {
        editingId = curState.commits.length;
      }
      this.renderCommits(commits, editingId);
    }
  }]);

  return ReviewEditor;
}(_richEditor.AbstractEditor);

exports.ReviewEditor = ReviewEditor;