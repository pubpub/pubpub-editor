'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.MarkdownEditor = undefined;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _Autocomplete = require('./Autocomplete');

var _Autocomplete2 = _interopRequireDefault(_Autocomplete);

var _codemirror = require('codemirror');

var _codemirror2 = _interopRequireDefault(_codemirror);

var _radium = require('radium');

var _radium2 = _interopRequireDefault(_radium);

var _simplemde = require('simplemde');

var _simplemde2 = _interopRequireDefault(_simplemde);

var _autocompleteConfig = require('./autocompleteConfig');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var styles = void 0;
var MarkdownEditor = exports.MarkdownEditor = _react2.default.createClass({
	displayName: 'MarkdownEditor',

	propTypes: {
		initialContent: _react.PropTypes.string,
		onChange: _react.PropTypes.func,
		handleFileUpload: _react.PropTypes.func,
		localUsers: _react.PropTypes.array,
		localPubs: _react.PropTypes.array,
		localFiles: _react.PropTypes.array,
		localReferences: _react.PropTypes.array,
		localHighlights: _react.PropTypes.array,
		globalCategories: _react.PropTypes.array
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
						var prevChars = currentLine.substring(0, currentCursor.ch);
						var startIndex = prevChars.lastIndexOf(' ') + 1;
						var startLetter = currentLine.charAt(startIndex);
						var shouldMark = startLetter === '@' && nextCh === ' ' && !cm.getSelection();

						if (shouldMark && !_this.autocompleteMarker) {
							_this.autocompleteMarker = cm.markText({ line: currentCursor.line, ch: prevChars.lastIndexOf(' ') + 1 }, { line: currentCursor.line, ch: prevChars.lastIndexOf(' ') + 2 }, { className: 'testmarker' });

							setTimeout(function () {
								var container = document.getElementById('markdown-editor-container');
								var mark = document.getElementsByClassName('testmarker')[0];
								var top = mark.getBoundingClientRect().bottom - container.getBoundingClientRect().top;
								var left = mark.getBoundingClientRect().left - container.getBoundingClientRect().left;

								_this.setState({
									visible: true,
									top: top,
									left: left,
									input: currentLine.substring(startIndex + 1, nextChIndex) || ' '
								});
							}, 0);
						} else if (shouldMark) {
							_this.setState({
								input: currentLine.substring(startIndex + 1, nextChIndex)
							});
						} else if (!shouldMark && _this.autocompleteMarker) {
							_this.autocompleteMarker.clear();
							_this.autocompleteMarker = undefined;
							_this.setState({
								visible: false
							});
						}
					})();
				}
			});
			this.simpleMDE.codemirror.setOption('extraKeys', {
				Up: this.handleArrow,
				Down: this.handleArrow,
				Esc: this.handleEscape,
				Enter: this.handleEnter
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

	handleEnter: function handleEnter(cm) {
		if (!this.state.visible) {
			return _codemirror2.default.Pass;
		}
		return null;
	},

	onSelection: function onSelection(selectedObject) {
		var cm = this.simpleMDE.codemirror;
		(0, _autocompleteConfig.createMarkdownMention)(cm, selectedObject);
	},

	render: function render() {
		return _react2.default.createElement(
			'div',
			{ id: 'markdown-editor-container', style: styles.container },
			_react2.default.createElement(_Autocomplete2.default, {
				top: this.state.top,
				left: this.state.left,
				visible: this.state.visible,
				input: this.state.input,
				onSelection: this.onSelection,
				localUsers: this.props.localUsers,
				localPubs: this.props.localPubs,
				localFiles: this.props.localFiles,
				localReferences: this.props.localReferences,
				localHighlights: this.props.localHighlights,
				globalCategories: this.props.globalCategories }),
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