'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.RichEditor = undefined;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _Autocomplete = require('./Autocomplete');

var _Autocomplete2 = _interopRequireDefault(_Autocomplete);

var _prosemirrorSetup = require('../prosemirror-setup');

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

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

	propTypes: {
		initialContent: _react.PropTypes.object,
		onChange: _react.PropTypes.func,
		localUsers: _react.PropTypes.array,
		localPubs: _react.PropTypes.array,
		localFiles: _react.PropTypes.array,
		localReferences: _react.PropTypes.array,
		localHighlights: _react.PropTypes.array,
		globalCategories: _react.PropTypes.array
	},

	getInitialState: function getInitialState() {
		return {
			// docJSON: null,
			// fileMap: null,
			visible: undefined,
			top: 0,
			left: 0,
			input: '',
			menuTop: 0,
			inlineCenter: 0,
			inlineTop: 0
		};
	},
	componentWillMount: function componentWillMount() {},
	componentDidMount: function componentDidMount() {
		this.createEditor(null);
	},
	componentWillUpdate: function componentWillUpdate(nextProps) {},
	onChange: function onChange() {
		this.props.onChange(this.editor.view.state.toJSON().doc);
		// this.props.onChange(this.editor.view.state.doc);
		this.updateCoordsForMenus();
	},


	updateCoordsForMenus: function updateCoordsForMenus() {
		var currentPos = this.editor.view.state.selection.$to.pos;
		var container = document.getElementById('rich-editor-container');
		var menuTop = this.editor.view.coordsAtPos(currentPos).top - container.getBoundingClientRect().top + 5;

		if (!this.editor.view.state.selection.$cursor) {
			var currentFromPos = this.editor.view.state.selection.$from.pos;
			var currentToPos = this.editor.view.state.selection.$to.pos;
			var left = this.editor.view.coordsAtPos(currentFromPos).left - container.getBoundingClientRect().left;
			var right = this.editor.view.coordsAtPos(currentToPos).right - container.getBoundingClientRect().left;
			var inlineCenter = left + (right - left) / 2;
			var inlineTop = this.editor.view.coordsAtPos(currentFromPos).top - container.getBoundingClientRect().top;
			return this.setState({
				menuTop: menuTop,
				inlineCenter: inlineCenter,
				inlineTop: inlineTop
			});
		}

		return this.setState({
			menuTop: menuTop,
			inlineTop: 0,
			inlineCenter: 0
		});
	},

	getMarkdown: function getMarkdown() {
		return this.editor.toMarkdown();
	},
	getJSON: function getJSON() {
		return this.editor.toJSON();
	},
	createEditor: function createEditor(docJSON) {
		if (this.editor) {
			this.editor1.remove();
		}

		var place = _reactDom2.default.findDOMNode(this.refs.container);
		this.editor = new _prosemirrorSetup.RichEditor({
			place: place,
			contents: this.props.initialContent,
			// components: {
			// 	suggestComponent: mentionsComponent,
			// },
			handlers: {
				createFile: this.props.handleFileUpload,
				captureError: this.props.onError,
				onChange: this.onChange,
				updateMentions: this.updateMentions
			}
		});
	},
	updateMentions: function updateMentions(mentionInput) {
		var _this = this;

		if (mentionInput) {
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


	onSelection: function onSelection(selectedObject) {
		console.log(selectedObject);
		return this.editor.createMention(selectedObject.firstName || selectedObject.title || selectedObject.name || selectedObject.exact || selectedObject.key);
	},

	render: function render() {
		return _react2.default.createElement(
			'div',
			{ style: { position: 'relative' }, id: 'rich-editor-container' },
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
			!!this.state.menuTop && _react2.default.createElement('span', { style: { position: 'absolute', left: '-24px', top: this.state.menuTop, cursor: 'pointer' }, className: 'pt-icon-standard pt-icon-add' }),
			!!this.state.inlineTop && _react2.default.createElement(
				'div',
				{ className: 'pt-card pt-elevation-0 pt-dark', style: { position: 'absolute', height: '35px', lineHeight: '35px', padding: '0px 1em', top: this.state.inlineTop - 40, left: this.state.inlineCenter } },
				'Formatting'
			),
			_react2.default.createElement('div', { ref: 'container', className: 'pubEditor', id: 'pubEditor' })
		);
	}

});

exports.default = RichEditor;