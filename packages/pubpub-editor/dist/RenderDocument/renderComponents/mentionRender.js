'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MentionComponent = undefined;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var MentionComponent = exports.MentionComponent = _react2.default.createClass({
  displayName: 'MentionComponent',

  propTypes: {
    url: _react.PropTypes.string,
    type: _react.PropTypes.string
  },
  getInitialState: function getInitialState() {
    return {};
  },

  render: function render() {
    var _props = this.props,
        url = _props.url,
        type = _props.type,
        children = _props.children;

    return _react2.default.createElement(
      'a',
      { className: 'mention', href: url },
      children
    );
  }
});

exports.default = MentionComponent;