'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _components = require('./components');

var _prosemirrorState = require('prosemirror-state');

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _reactview = require('./reactview');

var _reactview2 = _interopRequireDefault(_reactview);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var HtmlView = function (_ReactView) {
  _inherits(HtmlView, _ReactView);

  function HtmlView(node, view, getPos, options) {
    _classCallCheck(this, HtmlView);

    return _possibleConstructorReturn(this, (HtmlView.__proto__ || Object.getPrototypeOf(HtmlView)).call(this, node, view, getPos, options));
  }

  _createClass(HtmlView, [{
    key: 'bindFunctions',
    value: function bindFunctions() {
      _get(HtmlView.prototype.__proto__ || Object.getPrototypeOf(HtmlView.prototype), 'bindFunctions', this).call(this);
      this.valueChanged = this.valueChanged.bind(this);
      this.forceSelection = this.forceSelection.bind(this);
    }
  }, {
    key: 'renderElement',
    value: function renderElement(domChild) {
      var content = this.node.attrs ? this.node.attrs.content : null;
      return _reactDom2.default.render(_react2.default.createElement(_components.HtmlComponent, {
        forceSelection: this.forceSelection,
        content: content }), domChild);
    }
  }, {
    key: 'forceSelection',
    value: function forceSelection() {
      var pos = this.getPos();
      var sel = _prosemirrorState.NodeSelection.create(this.view.state.doc, pos);
      var transaction = this.view.state.tr.setSelection(sel);
      // this.reactElement.focusAndSelect();
      this.view.dispatch(transaction);
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
    key: 'stopEvent',
    value: function stopEvent(evt) {
      if (evt.type === "keypress" || evt.type === "input" || evt.type === "keydown" || evt.type === "keyup" || evt.type === "paste" || evt.type === "mousedown") {
        return true;
      }
      return false;
    }
  }]);

  return HtmlView;
}(_reactview2.default);

exports.default = HtmlView;