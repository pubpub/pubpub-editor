'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.FullEditor = undefined;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _MarkdownEditor = require('./MarkdownEditor');

var _MarkdownEditor2 = _interopRequireDefault(_MarkdownEditor);

var _RichEditor = require('./RichEditor');

var _RichEditor2 = _interopRequireDefault(_RichEditor);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

require('../../style/base.scss');

var FullEditor = exports.FullEditor = _react2.default.createClass({
	displayName: 'FullEditor',


	propTypes: {
		initialContent: _react.PropTypes.oneOfType([_react.PropTypes.object, _react.PropTypes.string]),
		onChange: _react.PropTypes.func,
		handleFileUpload: _react.PropTypes.func,
		handleReferenceAdd: _react.PropTypes.func,

		localUsers: _react.PropTypes.array,
		localPubs: _react.PropTypes.array,
		localFiles: _react.PropTypes.array,
		localReferences: _react.PropTypes.array,
		localHighlights: _react.PropTypes.array,
		localPages: _react.PropTypes.array,
		globalCategories: _react.PropTypes.array,

		// Unique to Full Editor
		mode: _react.PropTypes.string
	},

	render: function render() {
		if (this.props.mode === 'rich') {
			return _react2.default.createElement(_RichEditor2.default, this.props);
		}
		return _react2.default.createElement(_MarkdownEditor2.default, this.props);
	}
});

exports.default = FullEditor;