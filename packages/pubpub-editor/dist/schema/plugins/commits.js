'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _prosemirrorTransform = require('prosemirror-transform');

var _cuid = require('cuid');

var _cuid2 = _interopRequireDefault(_cuid);

var _pluginKeys = require('./pluginKeys');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/*
  - better cross browser message passing?
*/

/*
Functions:
  - Keep an up to date document that actually works and error checkcs
  - Receive 'commits' from other people
  - Commits are dependent the client to add them
  - Ability to merge between
  - individual commits get uuids, store and replace by them?
*/

var mergeSteps = function mergeSteps(steps) {
  var mergedSteps = [];
  var mergingStep = null;
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = steps[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var step = _step.value;

      if (!mergingStep) {
        mergingStep = step;
      } else {
        var tryMergeStep = mergingStep.merge(step);
        if (tryMergeStep) {
          mergingStep = tryMergeStep;
        } else {
          mergedSteps.push(mergingStep);
          mergingStep = null;
        }
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

  if (mergingStep) {
    mergedSteps.push(mergingStep);
  }
  return mergedSteps;
};

var describeStep = function describeStep(step) {
  var description = '';
  if (step instanceof _prosemirrorTransform.ReplaceStep) {
    if (step.slice.size === 0) {
      // needs to be able to remake doc
      description = "Delete";
    } else {
      description = "Insert";
      var content = step.slice.content.content;
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = content[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var node = _step2.value;

          description += ' ' + node.textContent;
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
    }
  }

  // this is for modifying attributes
  else if (step instanceof _prosemirrorTransform.ReplaceAroundStep) {
      // Need
      console.log(step);
      var _description = "Replace ";
      var _content = step.slice.content.content;
      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = _content[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var _node = _step3.value;

          _description += ' ' + _node.textContent;
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

      return _description;
    } else {
      console.log(step);
    }
  return description;
};

var Commit = function () {
  function Commit(step) {
    _classCallCheck(this, Commit);

    this.start = null;
    this.end = null;
    this.uuid = (0, _cuid2.default)();
    this.steps = [];
    if (step) {
      this.add(step);
    }
  }

  _createClass(Commit, [{
    key: 'add',
    value: function add(step) {
      var _this = this;

      var stepMap = step.getMap();

      if (this.start === null) {
        stepMap.forEach(function (_start, _end, rStart, rEnd) {
          _this.start = rStart;
          _this.end = rEnd;
        });
        this.steps.push(step);
        return true;
      }

      this.start = stepMap.map(this.start);
      this.end = stepMap.map(this.end);

      var start = this.start,
          end = this.end;

      var adjacent = void 0;

      stepMap.forEach(function (_start, _end, rStart, rEnd) {
        if (start <= rEnd && end >= rStart) adjacent = true;
        if (adjacent) {
          if (rStart < start) {
            _this.start = rStart;
          }
          if (rEnd > end) {
            _this.end = rEnd;
          }
        }
      });

      if (adjacent) {
        this.steps.push(step);
      }

      return adjacent;
    }
  }]);

  return Commit;
}();

var CommitTracker = function () {
  function CommitTracker(plugin) {
    var _this2 = this;

    _classCallCheck(this, CommitTracker);

    this.reset = function (step) {
      var editorState = _this2.plugin.spec.editorView.state;
      var firebasePlugin = (0, _pluginKeys.getPlugin)('firebase', editorState);
      if (_this2.commit) {
        var mergedSteps = mergeSteps(_this2.commit.steps);
        var description = mergedSteps ? describeStep(mergedSteps[mergedSteps.length - 1]) : 'No Description';
        if (mergedSteps.length > 1) {
          console.log('Got merged steps', mergedSteps, _this2.commit.steps, description);
        }
        var _commit = _this2.commit,
            steps = _commit.steps,
            uuid = _commit.uuid,
            start = _commit.start,
            end = _commit.end;

        firebasePlugin.props.commit({ description: description, steps: steps, uuid: uuid, start: start, end: end });
      }

      _this2.commit = new Commit(step);
    };

    this.add = function (step) {
      if (!_this2.commit) {
        _this2.commit = new Commit();
      }
      var adjacent = _this2.commit.add(step);

      if (!adjacent) {
        _this2.reset(step);
      }
      return adjacent;
    };

    this.plugin = plugin;
    this.commit = null;
  }

  _createClass(CommitTracker, [{
    key: 'uuid',
    get: function get() {
      return this.commit.uuid;
    }
  }]);

  return CommitTracker;
}();

exports.CommitTracker = CommitTracker;