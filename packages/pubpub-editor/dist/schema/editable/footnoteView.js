'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _prosemirrorModel = require('prosemirror-model');

var _plugins = require('../plugins');

var _components = require('./components');

var _prosemirrorState = require('prosemirror-state');

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _reactview = require('./reactview');

var _reactview2 = _interopRequireDefault(_reactview);

var _docOperations = require('../../utils/doc-operations');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var FootnoteView = function (_ReactView) {
  _inherits(FootnoteView, _ReactView);

  function FootnoteView(node, view, getPos, options) {
    _classCallCheck(this, FootnoteView);

    var _this = _possibleConstructorReturn(this, (FootnoteView.__proto__ || Object.getPrototypeOf(FootnoteView)).call(this, node, view, getPos, options));

    var decorations = options.decorations;
    _this.renderDecorations(decorations);
    return _this;
  }

  _createClass(FootnoteView, [{
    key: 'renderDecorations',
    value: function renderDecorations(decorations) {
      if (!decorations) {
        return;
      }
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = decorations[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var decoration = _step.value;

          if (decoration.type.spec && decoration.type.spec.label) {
            this.reactElement.updateLabel(decoration.type.spec.label);
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
    }
  }, {
    key: 'bindFunctions',
    value: function bindFunctions() {
      this.forceSelection = this.forceSelection.bind(this);
      this.updateContent = this.updateContent.bind(this);
      this.renderDecorations = this.renderDecorations.bind(this);

      _get(FootnoteView.prototype.__proto__ || Object.getPrototypeOf(FootnoteView.prototype), 'bindFunctions', this).call(this);
    }
  }, {
    key: 'renderElement',
    value: function renderElement(domChild) {
      var node = this.node;
      // updateParams={this.updateNodeParams} {...node.attrs}
      var nodeAttrs = node.attrs;

      var footnoteElement = _reactDom2.default.render(_react2.default.createElement(_components.FootnoteComponent, _extends({
        updateContent: this.updateContent,
        setSelection: this.setSelection,
        forceSelection: this.forceSelection
      }, nodeAttrs)), domChild);

      // this.contentDOM = embedElement.getInsert();
      return footnoteElement;
    }
  }, {
    key: 'updateContent',
    value: function updateContent(content) {
      _get(FootnoteView.prototype.__proto__ || Object.getPrototypeOf(FootnoteView.prototype), 'updateAttrs', this).call(this, { content: content });
    }
  }, {
    key: 'update',
    value: function update(node, decorations) {
      if (!_get(FootnoteView.prototype.__proto__ || Object.getPrototypeOf(FootnoteView.prototype), 'update', this).call(this, node, decorations)) {
        return false;
      }
      this.renderDecorations(decorations);
      return true;
    }
  }, {
    key: 'stopEvent',
    value: function stopEvent(evt) {
      if (evt.type === "keypress" || evt.type === "input" || evt.type === "keydown" || evt.type === "keyup" || evt.type === "paste" || evt.type === "mousedown") {
        return true;
      }
      return false;
    }
  }, {
    key: 'selectNode',
    value: function selectNode() {
      this.reactElement.setSelected(true);
      // this.reactElement.focusAndSelect();
    }
  }, {
    key: 'deselectNode',
    value: function deselectNode() {
      this.reactElement.setSelected(false);
    }
  }]);

  return FootnoteView;
}(_reactview2.default);

exports.default = FootnoteView;