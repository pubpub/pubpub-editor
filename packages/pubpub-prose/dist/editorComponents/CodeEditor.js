'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.CodeEditor = undefined;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _codemirror = require('codemirror');

var _codemirror2 = _interopRequireDefault(_codemirror);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

require('../../style/code.scss');

var styles = void 0;
var CodeEditor = exports.CodeEditor = _react2.default.createClass({
	displayName: 'CodeEditor',

	propTypes: {
		initialContent: _react.PropTypes.string,
		onChange: _react.PropTypes.func
	},

	codeMirror: undefined,

	componentDidMount: function componentDidMount() {
		var _this = this;

		var element = document.getElementById('myCodeEditor');
		if (element) {
			this.codeMirror = _codemirror2.default.fromTextArea(element, {
				autofocus: true
			});

			if (this.props.onChange) {
				this.codeMirror.on('change', function (cm) {
					_this.props.onChange(cm.doc.getValue());
				});
			}
		}
	},
	componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
		if (this.props.initialContent !== nextProps.initialContent) {
			this.codeMirror.value(nextProps.initialContent);
		}
	},
	render: function render() {
		return _react2.default.createElement(
			'div',
			{ id: 'code-editor-container', style: styles.container },
			_react2.default.createElement('textarea', { id: 'myCodeEditor', value: this.props.initialContent })
		);
	}
});

exports.default = CodeEditor;


styles = {
	container: {
		position: 'relative'
	}
};