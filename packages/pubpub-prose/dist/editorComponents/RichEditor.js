'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.RichEditor = undefined;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _prosemirrorSetup = require('../prosemirror-setup');

var _Autocomplete = require('./Autocomplete');

var _Autocomplete2 = _interopRequireDefault(_Autocomplete);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*
Props outline:
<Editor
	mentionsComponent={component}
	files={array}, // Array of file objects.
	handleFileUpload={function}
	fileUploadComplete={object} // Data about completed file upload
	onChange={function} // To update editorState which is managed above Editor
	initialState={object}
	/>
*/

var RichEditor = exports.RichEditor = _react2.default.createClass({
	displayName: 'RichEditor',

	propTypes: {},

	getInitialState: function getInitialState() {
		return {
			// docJSON: null,
			// fileMap: null,
			visible: undefined,
			top: 0,
			left: 0,
			input: ''
		};
	},
	componentWillMount: function componentWillMount() {},
	componentDidMount: function componentDidMount() {
		this.createEditor(null);
	},
	componentWillUpdate: function componentWillUpdate(nextProps) {},
	onChange: function onChange(editorState) {
		this.props.onChange();
	},
	getMarkdown: function getMarkdown() {
		return this.editor.toMarkdown();
	},
	getJSON: function getJSON() {
		return this.editor.toJSON();
	},
	createEditor: function createEditor(docJSON) {
		var _props = this.props,
		    handleFileUpload = _props.handleFileUpload,
		    onError = _props.onError,
		    mentionsComponent = _props.mentionsComponent,
		    initialState = _props.initialState;


		if (this.editor) {
			this.editor1.remove();
		}
		var place = _reactDom2.default.findDOMNode(this.refs.container);
		this.editor = new _prosemirrorSetup.RichEditor({
			place: place,
			contents: initialState,
			// components: {
			// 	suggestComponent: mentionsComponent,
			// },
			handlers: {
				createFile: handleFileUpload,
				captureError: onError,
				onChange: this.onChange,
				updateMentions: this.updateMentions
			}
		});
	},
	updateMentions: function updateMentions(mentionInput) {
		var _this = this;

		if (!!mentionInput) {
			setTimeout(function () {
				var container = document.getElementById('rich-editor-container');
				var mark = document.getElementsByClassName('mention-marker')[0];
				var top = mark.getBoundingClientRect().bottom - container.getBoundingClientRect().top;
				var left = mark.getBoundingClientRect().left - container.getBoundingClientRect().left;
				_this.setState({
					visible: true,
					top: top,
					left: left,
					input: mentionInput
				});
			}, 0);
		} else {
			this.setState({ visible: false });
		}
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
			{ style: { position: 'relative' }, id: 'rich-editor-container' },
			_react2.default.createElement(_Autocomplete2.default, { style: autocompleteStyle, input: this.state.input }),
			_react2.default.createElement('div', { ref: 'container', className: 'pubEditor', id: 'pubEditor' })
		);
	}

});

exports.default = RichEditor;