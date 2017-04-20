'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.IframeRender = undefined;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _katex = require('katex');

var _katex2 = _interopRequireDefault(_katex);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// import katexStyles from './katex.css.js';

var styles = {};

var IframeRender = exports.IframeRender = _react2.default.createClass({
  displayName: 'IframeRender',

  propTypes: {
    url: _react.PropTypes.string,
    width: _react.PropTypes.string,
    height: _react.PropTypes.string
  },
  getInitialState: function getInitialState() {
    return {};
  },

  renderDisplay: function renderDisplay() {
    var _props = this.props,
        url = _props.url,
        width = _props.width,
        height = _props.height;


    return _react2.default.createElement('iframe', { ref: 'iframe',
      frameBorder: '0',
      src: url,
      style: { height: height, width: width },
      height: height,
      width: width });
  },


  render: function render() {
    return this.renderDisplay();
  }
});

exports.default = IframeRender;