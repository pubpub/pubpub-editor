'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.StoryBookRichEditor = undefined;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _reactRichEditor = require('./reactRichEditor');

var _reactRichEditor2 = _interopRequireDefault(_reactRichEditor);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

require("@blueprintjs/core/dist/blueprint.css");

var StoryBookRichEditor = exports.StoryBookRichEditor = _react2.default.createClass({
	displayName: 'StoryBookRichEditor',

	render: function render() {
		return _react2.default.createElement(_reactRichEditor2.default, this.props);
	}
});

exports.default = RichEditorWrapper;