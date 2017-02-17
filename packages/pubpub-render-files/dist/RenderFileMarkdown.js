'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.RenderFileMarkdown = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; /* eslint-disable no-param-reassign */


var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _radium = require('radium');

var _radium2 = _interopRequireDefault(_radium);

var _markdownReactJs = require('markdown-react-js');

var _markdownReactJs2 = _interopRequireDefault(_markdownReactJs);

var _markdownItSub = require('markdown-it-sub');

var _markdownItSub2 = _interopRequireDefault(_markdownItSub);

var _markdownItSup = require('markdown-it-sup');

var _markdownItSup2 = _interopRequireDefault(_markdownItSup);

var _RenderFile = require('./RenderFile');

var _RenderFile2 = _interopRequireDefault(_RenderFile);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function fileParser(state, silent) {
	var token = void 0;
	var UNESCAPE_RE = /\\([ \\!"#$%&'()*+,./:;<=>?@[\]^_`{|}~-])/g;
	var max = state.posMax;
	var start = state.pos;

	if (state.src.charAt(start) !== '!') {
		return false;
	}
	if (silent) {
		return false;
	} // don't run any pairs in validation mode
	if (state.src.charAt(start + 1) === '[') {
		return false;
	}
	if (start + 2 >= max) {
		return false;
	}

	state.pos = start + 1;
	while (state.pos < max) {
		if (state.src.charAt(state.pos) === ' ') {
			break;
		}
		state.pos += 1;
	}

	if (start + 1 === state.pos) {
		state.pos = start;return false;
	}

	var content = state.src.slice(start + 1, state.pos);
	if (content.match(/(^|[^\\])(\\\\)*[\n]/)) {
		state.pos = start;return false;
	}

	state.posMax = state.pos;
	state.pos = start + 1;

	// Earlier we checked !silent, but this implementation does not need it
	token = state.push('file_open', 'file', 1);
	token.markup = '!';

	token = state.push('text', '', 0);
	token.content = content.replace(UNESCAPE_RE, '$1');

	token = state.push('file_close', 'file', -1);
	token.markup = '!';

	state.pos = state.posMax + 1;
	state.posMax = max;
	return true;
}

var RenderFileMarkdown = exports.RenderFileMarkdown = _react2.default.createClass({
	displayName: 'RenderFileMarkdown',

	propTypes: {
		file: _react.PropTypes.object,
		allFiles: _react.PropTypes.array
	},

	handleIterate: function handleIterate(Tag, props, children, level) {
		if (Tag === 'file') {
			var allFiles = this.props.allFiles || [];
			var file = allFiles.reduce(function (previous, current) {
				if (current.name === children[0]) {
					return current;
				}
				return previous;
			}, undefined);
			if (file) {
				return _react2.default.createElement(_RenderFile2.default, { file: file, allFiles: this.props.allFiles });
			}
		}
		if (Tag === 'img') {
			return _react2.default.createElement(Tag, props);
		}
		return _react2.default.createElement(Tag, _extends({}, props, { children: children }));
	},

	filePlugin: function filePlugin(md) {
		md.inline.ruler.push('file', fileParser);
	},

	render: function render() {
		var file = this.props.file || {};
		return _react2.default.createElement(_markdownReactJs2.default, {
			text: file.content,
			onIterate: this.handleIterate,
			markdownOptions: {
				html: false,
				typographer: true,
				linkify: true
			},
			plugins: [_markdownItSub2.default, _markdownItSup2.default, this.filePlugin] });
	}
});

exports.default = (0, _radium2.default)(RenderFileMarkdown);