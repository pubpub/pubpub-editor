'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _prosemirrorState = require('prosemirror-state');

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _schema = require('../schema');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function computeChange(oldVal, newVal) {
  var start = 0,
      oldEnd = oldVal.length,
      newEnd = newVal.length;
  while (start < oldEnd && oldVal.charCodeAt(start) == newVal.charCodeAt(start)) {
    ++start;
  }while (oldEnd > start && newEnd > start && oldVal.charCodeAt(oldEnd - 1) == newVal.charCodeAt(newEnd - 1)) {
    oldEnd--;newEnd--;
  }
  return { from: start, to: oldEnd, text: newVal.slice(start, newEnd) };
}

var ReactView = function () {
  function ReactView(node, view, getPos, options) {
    _classCallCheck(this, ReactView);

    this.bindFunctions();
    this.options = options;
    this.block = options.block;
    this.node = node;
    this.view = view;
    this.getPos = getPos;
    this.value = node.textContent;
    var domChild = this.block ? document.createElement('div') : document.createElement('span');
    var reactElement = this.renderElement(domChild);
    var dom = domChild.childNodes[0];
    // dom.contentEditable = true;
    this.dom = domChild;
    this.reactElement = reactElement;
  }

  _createClass(ReactView, [{
    key: 'bindFunctions',
    value: function bindFunctions() {
      this.update = this.update.bind(this);
      this.valueChanged = this.valueChanged.bind(this);
    }
  }, {
    key: 'valueChanged',
    value: function valueChanged(value) {
      if (value != this.value) {
        var change = computeChange(this.value, value);
        this.value = value;
        var start = this.getPos() + 1;
        var transaction = this.view.state.tr.replaceWith(start + change.from, start + change.to, change.text ? _schema.schema.text(change.text) : null);
        this.view.dispatch(transaction);
      }
    }
  }, {
    key: 'updateAttrs',
    value: function updateAttrs(nodeAttrs) {
      var start = this.getPos();
      // const nodeType = schema.nodes.embed;
      var oldNodeAttrs = this.node.attrs;
      var transaction = this.view.state.tr.setNodeType(start, null, _extends({}, oldNodeAttrs, nodeAttrs));
      this.view.dispatch(transaction);
    }

    // Needs to be override by child classes

  }, {
    key: 'renderElement',
    value: function renderElement(domChild) {
      return null;
    }
  }, {
    key: 'update',
    value: function update(node, decorations) {
      if (node.type !== this.node.type) return false;
      if (node === this.node && this.decorations === decorations) {
        return true;
      }
      this.node = node;
      this.decorations = decorations;
      this.reactElement = this.renderElement(this.dom);
      return true;
    }
  }, {
    key: 'changeNode',
    value: function changeNode(nodeType, attrs, content) {

      // const nodeText = this.node.textContent;
      var newNode = nodeType.create(attrs, content);

      var start = this.getPos();
      var end = start + this.node.nodeSize;

      var transaction = this.view.state.tr.replaceWith(start, end, newNode);
      this.view.dispatch(transaction);
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

    /*
    setSelection() {
       const pos = this.getPos();
      const sel = NodeSelection.create(this.view.state.doc, pos);
      const transaction = this.view.state.tr.setSelection(sel);
      this.view.dispatch(transaction);
    }
    */

    /*
    setSelection(anchor, head) {
      console.log('got selection!', anchor, head);
    }
    */

    /*
      selectNode() {
        this.cm.focus()
      }
      */

    // Generally avoids 'index out of range' errors

  }, {
    key: 'ignoreMutation',
    value: function ignoreMutation(mutation) {
      return true;
    }

    /*
     stopEvent(evt) {
      if (evt.type === 'mousedown') {
        return false;
      }
      return true;
    }
    */

  }]);

  return ReactView;
}();

exports.default = ReactView;