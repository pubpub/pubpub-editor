"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MentionComponent = undefined;

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var MentionComponent = exports.MentionComponent = _react2.default.createClass({
  displayName: "MentionComponent",

  propTypes: {
    text: _react.PropTypes.string,
    url: _react.PropTypes.string,
    type: _react.PropTypes.string
  },
  getInitialState: function getInitialState() {
    return {};
  },
  getDefaultProps: function getDefaultProps() {},

  componentDidMount: function componentDidMount() {},

  render: function render() {
    var _props = this.props,
        url = _props.url,
        type = _props.type,
        text = _props.text;

    return _react2.default.createElement(
      "a",
      { target: "_blank", className: "mention", href: url },
      text
    );
  }
});

exports.default = MentionComponent;