'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.MarkdownEditor = undefined;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _radium = require('radium');

var _radium2 = _interopRequireDefault(_radium);

var _simplemde = require('simplemde');

var _simplemde2 = _interopRequireDefault(_simplemde);

var _codemirror = require('codemirror');

var _codemirror2 = _interopRequireDefault(_codemirror);

var _Autocomplete = require('./Autocomplete');

var _Autocomplete2 = _interopRequireDefault(_Autocomplete);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var styles = void 0;
var MarkdownEditor = exports.MarkdownEditor = _react2.default.createClass({
	displayName: 'MarkdownEditor',

	propTypes: {
		initialContent: _react.PropTypes.string,
		onChange: _react.PropTypes.func
	},

	simpleMDE: undefined,
	autocompleteMarker: undefined,

	getInitialState: function getInitialState() {
		return {
			visible: undefined,
			top: 0,
			left: 0,
			input: ''
		};
	},
	componentDidMount: function componentDidMount() {
		var _this = this;

		var element = document.getElementById('myMarkdownEditor');
		if (element) {
			this.simpleMDE = new _simplemde2.default({
				element: element,
				autoDownloadFontAwesome: false,
				autofocus: true,
				placeholder: 'Begin writing here...',
				spellChecker: false,
				status: false,
				toolbar: false,
				shortcuts: {
					togglePreview: null,
					toggleSideBySide: null,
					toggleFullScreen: null
				}
			});

			this.simpleMDE.value(this.props.initialContent || '');
			this.simpleMDE.codemirror.on('cursorActivity', function () {
				if (_this.props.onChange) {
					(function () {
						_this.props.onChange(_this.simpleMDE.value());
						var cm = _this.simpleMDE.codemirror;
						var currentCursor = cm.getCursor();
						var currentLine = cm.getLine(currentCursor.line);
						var nextChIndex = currentCursor.ch;
						var nextCh = currentLine.length > nextChIndex ? currentLine.charAt(nextChIndex) : ' ';
						// console.log(currentCursor);
						var prevChars = currentLine.substring(0, currentCursor.ch);
						var startIndex = prevChars.lastIndexOf(' ') + 1;
						var startLetter = currentLine.charAt(startIndex);
						// console.log(prevChars.lastIndexOf(' ') + 1, currentCursor.ch);
						var shouldMark = startLetter === '@' && nextCh === ' ' && !cm.getSelection();

						// console.log('Heyo ', startLetter, nextCh, currentCursor.ch, startIndex, currentCursor, cm.getSelection());
						if (shouldMark && !_this.autocompleteMarker) {
							// console.log('Add it')
							_this.autocompleteMarker = cm.markText({ line: currentCursor.line, ch: prevChars.lastIndexOf(' ') + 1 }, { line: currentCursor.line, ch: prevChars.lastIndexOf(' ') + 2 }, { className: 'testmarker' });

							// console.log(document.getElementsByClassName('testmarker'), document.getElementsByClassName('testmarker')[0]);
							setTimeout(function () {
								var container = document.getElementById('markdown-editor-container');
								var mark = document.getElementsByClassName('testmarker')[0];
								// console.log(container, mark);
								var top = mark.getBoundingClientRect().bottom - container.getBoundingClientRect().top;
								var left = mark.getBoundingClientRect().left - container.getBoundingClientRect().left;

								console.log(startIndex, nextChIndex);
								_this.setState({
									visible: true,
									top: top,
									left: left,
									input: currentLine.substring(startIndex + 1, nextChIndex)
								});
							}, 0);
						} else if (shouldMark) {
							_this.setState({
								input: currentLine.substring(startIndex + 1, nextChIndex)
							});
						} else if (!shouldMark && _this.autocompleteMarker) {
							// console.log('Clearing!');
							_this.autocompleteMarker.clear();
							_this.autocompleteMarker = undefined;
							_this.setState({
								visible: false
							});
						}
						// console.log(startLetter, nextCh);
					})();
				}
			});
			// this.simpleMDE.codemirror.on('keyHandled', this.handleKey);
			this.simpleMDE.codemirror.setOption('extraKeys', {
				Up: this.handleArrow,
				Down: this.handleArrow,
				Esc: this.handleEscape
			});
		}
	},
	componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
		if (this.props.initialContent !== nextProps.initialContent) {
			this.simpleMDE.value(nextProps.initialContent);
		}
	},


	handleArrow: function handleArrow(cm) {
		if (!this.state.visible) {
			return _codemirror2.default.Pass;
		}
		return null;
	},

	handleEscape: function handleEscape(cm) {
		this.setState({ visible: false });
		return _codemirror2.default.Pass;
	},

	mentionStyle: function mentionStyle(top, left, visible) {
		return {
			zIndex: 10,
			position: 'absolute',
			left: left,
			top: top,
			opacity: visible ? 1 : 0,
			pointerEvents: visible ? 'auto' : 'none',
			transition: '.1s linear opacity'
		};
	},

	render: function render() {
		var autocompleteStyle = this.mentionStyle(this.state.top, this.state.left, this.state.visible);
		return _react2.default.createElement(
			'div',
			{ id: 'markdown-editor-container', style: styles.container },
			_react2.default.createElement(_Autocomplete2.default, { style: autocompleteStyle, input: this.state.input }),
			_react2.default.createElement('textarea', { id: 'myMarkdownEditor' })
		);
	}
});

exports.default = (0, _radium2.default)(MarkdownEditor);


styles = {
	container: {
		position: 'relative'
	}
};