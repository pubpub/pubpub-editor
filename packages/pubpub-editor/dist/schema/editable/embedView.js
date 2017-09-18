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

var EmbedView = function (_ReactView) {
  _inherits(EmbedView, _ReactView);

  function EmbedView(node, view, getPos, options) {
    _classCallCheck(this, EmbedView);

    return _possibleConstructorReturn(this, (EmbedView.__proto__ || Object.getPrototypeOf(EmbedView)).call(this, node, view, getPos, options));
  }

  _createClass(EmbedView, [{
    key: 'bindFunctions',
    value: function bindFunctions() {
      this.updateCaption = this.updateCaption.bind(this);
      this.createCaption = this.createCaption.bind(this);
      this.removeCaption = this.removeCaption.bind(this);
      this.forceSelection = this.forceSelection.bind(this);

      _get(EmbedView.prototype.__proto__ || Object.getPrototypeOf(EmbedView.prototype), 'bindFunctions', this).call(this);
    }
  }, {
    key: 'renderElement',
    value: function renderElement(domChild) {
      var node = this.node;
      var nodeAttrs = node.attrs;

      // if relative filenames are enabled, then use the relative file in the filemap if it exists
      if (nodeAttrs.filename) {
        var state = this.view.state;
        var relativeFilePlugin = (0, _plugins.getPlugin)('relativefiles', state);
        if (relativeFilePlugin) {
          var fileURL = relativeFilePlugin.props.getFile({ filename: nodeAttrs.filename, state: state });
          if (fileURL) {
            nodeAttrs.url = fileURL;
          }
        }
      }

      var contentNode = node.content;
      var hasCaption = contentNode && contentNode.content && contentNode.content.length > 0;
      var caption = hasCaption ? contentNode.content[0].content.content[0].text : null;

      var embedElement = _reactDom2.default.render(_react2.default.createElement(_components.EmbedComponent, _extends({
        updateAttrs: this.valueChanged,
        setSelection: this.setSelection,
        updateCaption: this.updateCaption,
        createCaption: this.createCaption,
        removeCaption: this.removeCaption,
        forceSelection: this.forceSelection
      }, nodeAttrs, {
        caption: caption
      })), domChild);

      // this.contentDOM = embedElement.getInsert();
      return embedElement;
    }
  }, {
    key: 'valueChanged',
    value: function valueChanged(nodeAttrs) {
      var start = this.getPos();
      var nodeType = this.view.state.schema.nodes.embed;
      var oldNodeAttrs = this.node.attrs;
      var transaction = this.view.state.tr.setNodeType(start, nodeType, _extends({}, oldNodeAttrs, nodeAttrs));
      this.view.dispatch(transaction);
    }
  }, {
    key: 'createCaption',
    value: function createCaption() {
      // Need to check if caption already exists?
      var from = this.getPos() + 1;
      var textnode = this.view.state.schema.text('Enter caption');
      var captionNode = this.view.state.schema.nodes.caption.create({}, textnode);
      var transaction = this.view.state.tr.insert(from, captionNode);
      this.view.dispatch(transaction);
    }
  }, {
    key: 'removeCaption',
    value: function removeCaption() {
      var textNode = this.getTextNode();
      if (!textNode) {
        console.log('could not find textNode');
        return;
      }
      var from = textNode.from - 1;
      var to = textNode.to;
      var checkSlice = this.view.state.doc.slice(from, to);
      var transaction = this.view.state.tr.deleteRange(from, to);
      this.view.dispatch(transaction);
    }
  }, {
    key: 'getTextNode',
    value: function getTextNode() {
      var textNode = (0, _docOperations.findNodesWithIndex)(this.node, 'text');
      if (textNode.length === 1) {
        textNode = textNode[0];
      } else {
        console.log('could not find textnode', this.node);
        return null;
      }
      var from = this.getPos() + textNode.index + 1;
      var to = from + textNode.node.nodeSize;
      return { from: from, to: to };
    }
  }, {
    key: 'updateCaption',
    value: function updateCaption(txt) {
      // assumes no marks or anything
      var textNode = this.getTextNode();

      if (!textNode) {
        console.log('could not find textNode');
        return;
      }

      var slice = new _prosemirrorModel.Slice(_prosemirrorModel.Fragment.from(this.view.state.schema.text(txt)), 0, 0);
      var transaction = this.view.state.tr.replaceRange(textNode.from, textNode.to, slice);
      this.view.dispatch(transaction);
    }

    /*
    setSelection(anchor, head) {
      console.log(anchor, head);NodeSelection
      this.reactElement.setSelected(true);
      // this.reactElement.focusAndSelect();
    }
    */

    /*
     setSelection() {
      console.log('SETTING SELECTION!');
      const pos = this.getPos();
      const sel = NodeSelection.create(this.view.state.doc, pos);
      const transaction = this.view.state.tr.setSelection(sel);
      this.reactElement.setSelected(true);
      this.view.dispatch(transaction);
    }
      */

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
      this.reactElement.focusAndSelect();
    }
  }, {
    key: 'deselectNode',
    value: function deselectNode() {
      this.reactElement.setSelected(false);
    }
  }]);

  return EmbedView;
}(_reactview2.default);

exports.default = EmbedView;