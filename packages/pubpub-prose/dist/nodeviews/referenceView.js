'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _reactview = require('./reactview');

var _reactview2 = _interopRequireDefault(_reactview);

var _components = require('./components');

var _plugins = require('../plugins');

var _setup = require('../setup');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ReferenceView = function (_ReactView) {
  _inherits(ReferenceView, _ReactView);

  function ReferenceView(node, view, getPos, options) {
    _classCallCheck(this, ReferenceView);

    var _this = _possibleConstructorReturn(this, (ReferenceView.__proto__ || Object.getPrototypeOf(ReferenceView)).call(this, node, view, getPos, options));

    var decorations = options.decorations;
    _this.getCitationData();
    _this.renderDecorations(decorations);
    return _this;
  }

  _createClass(ReferenceView, [{
    key: 'renderDecorations',
    value: function renderDecorations(decorations) {
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = decorations[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var decoration = _step.value;

          if (decoration.type.options && decoration.type.options.label) {
            this.reactElement.updateLabel(decoration.type.options.label);
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
      this.valueChanged = this.valueChanged.bind(this);
      _get(ReferenceView.prototype.__proto__ || Object.getPrototypeOf(ReferenceView.prototype), 'bindFunctions', this).call(this);
    }
  }, {
    key: 'renderElement',
    value: function renderElement(domChild) {
      var node = this.node;
      return _reactDom2.default.render(_react2.default.createElement(_components.ReferenceComponent, _extends({ updateValue: this.valueChanged, value: this.value }, node.attrs)), domChild);
    }
  }, {
    key: 'getCitationData',
    value: function getCitationData() {
      // get Count
      var citations = (0, _plugins.getPluginState)('citations', this.view.state);
    }

    // Register citation info?

  }, {
    key: 'getCountOfCitation',
    value: function getCountOfCitation() {}
  }, {
    key: 'valueChanged',
    value: function valueChanged() {
      var start = this.getPos();
      var nodeType = _setup.schema.nodes.reference;
      var oldNodeAttrs = this.node.attrs;
      var transform = this.view.state.tr.setNodeType(start, nodeType, { citationID: 5 });
      var action = transform.action();
      this.view.props.onAction(action);
    }
  }, {
    key: 'update',
    value: function update(node, decorations) {
      if (!_get(ReferenceView.prototype.__proto__ || Object.getPrototypeOf(ReferenceView.prototype), 'update', this).call(this, node, decorations)) {
        return false;
      }
      this.renderDecorations(decorations);
      return true;
    }
  }, {
    key: 'selectNode',
    value: function selectNode() {
      this.reactElement.setSelected(true);
    }
  }, {
    key: 'deselectNode',
    value: function deselectNode() {
      this.reactElement.setSelected(false);
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      // const citations = getPlugin('citations', this.view.state);
      // citations.removeReference(citationID);
    }
  }]);

  return ReferenceView;
}(_reactview2.default);

exports.default = ReferenceView;

// How to click on a view and cite it??
// A plugin that tracks citations and highlights. When you click on a view,
//
// A plugin can be persistent and store state...
// A plugin can add persistence to it
//

// What tracks citation order and terms? What updates citation orders?
// What orders references?