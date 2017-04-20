'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.HtmlRender = undefined;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _xss = require('xss');

var _xss2 = _interopRequireDefault(_xss);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var HtmlRender = exports.HtmlRender = _react2.default.createClass({
  displayName: 'HtmlRender',

  propTypes: {
    content: _react.PropTypes.string
  },
  getInitialState: function getInitialState() {
    return {};
  },

  render: function render() {
    var content = this.props.content;


    return _react2.default.createElement('div', { dangerouslySetInnerHTML: { __html: (0, _xss2.default)(content) } });
  }
});

exports.default = HtmlRender;