'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.LatexEditor = undefined;

var _block;

var _radium = require('radium');

var _radium2 = _interopRequireDefault(_radium);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _katex = require('katex');

var _katex2 = _interopRequireDefault(_katex);

var _katexCss = require('./katex.css.js');

var _katexCss2 = _interopRequireDefault(_katexCss);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var styles = {};

var LatexEditor = exports.LatexEditor = _react2.default.createClass({
  displayName: 'LatexEditor',

  propTypes: {
    value: _react.PropTypes.string,
    block: _react.PropTypes.bool
  },
  getInitialState: function getInitialState() {
    var displayHTML = this.generateHTML(this.props.value);
    return {
      editing: false,
      displayHTML: displayHTML
    };
  },
  generateHTML: function generateHTML(text) {
    return _katex2.default.renderToString(text, { displayMode: this.props.block, throwOnError: false });
  },
  renderDisplay: function renderDisplay() {
    var displayHTML = this.state.displayHTML;
    var _props = this.props,
        value = _props.value,
        block = _props.block;


    return _react2.default.createElement(
      'span',
      { style: styles.display({ block: block }) },
      _react2.default.createElement(_radium.Style, { rules: _katexCss2.default }),
      _react2.default.createElement('span', {
        ref: 'latexElem',
        className: 'pub-embed-latex',
        dangerouslySetInnerHTML: { __html: displayHTML },
        style: styles.output })
    );
  },


  render: function render() {
    return this.renderDisplay();
  }
});

styles = {
  wrapper: {
    backgroundColor: 'blue'
  },
  block: (_block = {
    position: 'absolute',
    left: '0px',
    fontSize: '15px',
    border: '1px solid black',
    borderRadius: '1px',
    width: '100px',
    height: '25px',
    lineHeight: '25px'
  }, _defineProperty(_block, 'width', 'auto'), _defineProperty(_block, 'padding', '3px 6px'), _defineProperty(_block, 'marginTop', '5px'), _defineProperty(_block, 'cursor', 'pointer'), _block),
  display: function display(_ref) {
    var block = _ref.block;

    return {
      fontSize: block ? '20px' : '0.9em'
    };
  }
};

exports.default = LatexEditor;