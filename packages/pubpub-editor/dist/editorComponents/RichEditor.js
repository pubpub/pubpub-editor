'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.RichEditor = undefined;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _Autocomplete = require('../Autocomplete/Autocomplete');

var _Autocomplete2 = _interopRequireDefault(_Autocomplete);

var _firebaseEditor = require('../prosemirror-setup/editors/firebaseEditor');

var _FormattingMenu = require('../FormattingMenu/FormattingMenu');

var _FormattingMenu2 = _interopRequireDefault(_FormattingMenu);

var _InsertMenu = require('../InsertMenu/InsertMenu');

var _InsertMenu2 = _interopRequireDefault(_InsertMenu);

var _prosemirrorSetup = require('../prosemirror-setup');

var _TableMenu = require('../TableMenu/TableMenu');

var _TableMenu2 = _interopRequireDefault(_TableMenu);

var _autocompleteConfig = require('../Autocomplete/autocompleteConfig');

var _migrateDiffs = require('../migrate/migrateDiffs');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// import ReactDOM from 'react-dom';
var RichEditor = exports.RichEditor = _react2.default.createClass({
	displayName: 'RichEditor',

	propTypes: {
		initialContent: _react.PropTypes.object,
		onChange: _react.PropTypes.func,
		handleFileUpload: _react.PropTypes.func,
		handleReferenceAdd: _react.PropTypes.func,

		localUsers: _react.PropTypes.array,
		localPubs: _react.PropTypes.array,
		localFiles: _react.PropTypes.array,
		localReferences: _react.PropTypes.array,
		localHighlights: _react.PropTypes.array,
		localPages: _react.PropTypes.array,
		globalCategories: _react.PropTypes.array
	},

	getInitialState: function getInitialState() {
		return {
			visible: undefined,
			top: 0,
			left: 0,
			input: '',
			menuTop: 7,
			inlineCenter: 0,
			inlineTop: 0
		};
	},
	componentWillMount: function componentWillMount() {},
	componentDidMount: function componentDidMount() {
		this.createEditor(null);
	},
	onChange: function onChange() {
		// Should be called on every document change (delete, addition, etc)
		// is toJSON expensive?
		this.props.onChange(this.editor.view.state.doc.toJSON());
		if (this.insertMenu) {
			this.insertMenu.updatePosition(this.editor.view);
		}
		if (this.tableMenu) {
			this.tableMenu.updatePosition(this.editor.view);
		}

		this.updateCoordsForMenus();
	},
	onCursorChange: function onCursorChange() {
		// Should be called on every cursor update
		if (this.insertMenu) {
			this.insertMenu.updatePosition(this.editor.view);
		}
		if (this.tableMenu) {
			this.tableMenu.updatePosition(this.editor.view);
		}
		this.updateCoordsForMenus();
	},


	updateCoordsForMenus: function updateCoordsForMenus() {
		var currentPos = this.editor.view.state.selection.$to.pos;

		var currentNode = this.editor.view.state.doc.nodeAt(currentPos - 1);
		var isRoot = this.editor.view.state.selection.$to.depth === 2;

		var container = document.getElementById('rich-editor-container');

		if (!this.editor.view.state.selection.$cursor && currentNode && currentNode.text) {
			var currentFromPos = this.editor.view.state.selection.$from.pos;
			var currentToPos = this.editor.view.state.selection.$to.pos;
			var left = this.editor.view.coordsAtPos(currentFromPos).left - container.getBoundingClientRect().left;
			var right = this.editor.view.coordsAtPos(currentToPos).right - container.getBoundingClientRect().left;
			var inlineCenter = left + (right - left) / 2;
			var inlineTop = this.editor.view.coordsAtPos(currentFromPos).top - container.getBoundingClientRect().top;
			return this.setState({
				inlineCenter: inlineCenter,
				inlineTop: inlineTop
			});
		}

		return this.setState({
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

		// const place = ReactDOM.findDOMNode(this.refs.container);
		var place = document.getElementById('pubEditor');
		var fileMap = this.generateFileMap();

		var contents = this.props.initialContent;
		(0, _migrateDiffs.migrateMarks)(contents);

		var EditorClass = this.props.collaborative ? _firebaseEditor.FirebaseEditor : _prosemirrorSetup.RichEditor;

		this.editor = new EditorClass({
			place: place,
			contents: contents,
			config: {
				fileMap: fileMap,
				referencesList: this.props.localFiles,
				trackChanges: this.props.trackChanges
			},
			props: {
				fileMap: fileMap,
				referencesList: this.props.localFiles,
				createFile: this.props.handleFileUpload,
				createReference: this.props.handleReferenceAdd,
				captureError: this.props.onError,
				onChange: this.onChange,
				onCursor: this.onCursorChange,
				updateMentions: this.updateMentions
			},
			handlers: {
				createFile: this.props.handleFileUpload,
				captureError: this.props.onError,
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
				if (!container || !mark) {
					return _this.setState({ visible: false });
				}
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


	onMentionSelection: function onMentionSelection(selectedObject) {
		var mentionPos = this.editor.getMentionPos();
		(0, _autocompleteConfig.createRichMention)(this.editor, selectedObject, mentionPos.start, mentionPos.end);
	},

	generateFileMap: function generateFileMap() {
		var files = this.props.localFiles || [];
		var fileMap = {};
		var _iteratorNormalCompletion = true;
		var _didIteratorError = false;
		var _iteratorError = undefined;

		try {
			for (var _iterator = files[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
				var file = _step.value;

				fileMap[file.name] = file.url;
			}
		} catch (err) {
			_didIteratorError = true;
			_iteratorError = err;
		} finally {
			try {
				if (!_iteratorNormalCompletion && _iterator.return) {
					_iterator.return();
				}
			} finally {
				if (_didIteratorError) {
					throw _iteratorError;
				}
			}
		}

		return fileMap;
	},

	playback: function playback() {
		this.editor.playbackDoc();
	},

	render: function render() {
		var _this2 = this;

		return _react2.default.createElement(
			'div',
			{ style: { position: 'relative' }, id: 'rich-editor-container' },
			_react2.default.createElement(_Autocomplete2.default, {
				top: this.state.top,
				left: this.state.left,
				visible: this.state.visible,
				input: this.state.input,
				onSelection: this.onMentionSelection,
				localUsers: this.props.localUsers,
				localPubs: this.props.localPubs,
				localFiles: this.props.localFiles,
				localReferences: this.props.localReferences,
				localHighlights: this.props.localHighlights,
				localPages: this.props.localPages,
				globalCategories: this.props.globalCategories }),
			_react2.default.createElement(_InsertMenu2.default, {
				ref: function ref(input) {
					_this2.insertMenu = input;
				},
				editor: this.editor,
				allReferences: this.props.localReferences,
				handleFileUpload: this.props.handleFileUpload,
				handleReferenceAdd: this.props.handleReferenceAdd }),
			_react2.default.createElement(_TableMenu2.default, {
				ref: function ref(input) {
					_this2.tableMenu = input;
				},
				editor: this.editor }),
			this.editor && _react2.default.createElement(_FormattingMenu2.default, {
				editor: this.editor,
				top: this.state.inlineTop,
				left: this.state.inlineCenter }),
			_react2.default.createElement('div', { className: 'pubEditor', id: 'pubEditor' })
		);
	}

});

exports.default = RichEditor;