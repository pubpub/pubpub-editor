'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _EditorProvider = require('./EditorProvider');

var _EditorProvider2 = _interopRequireDefault(_EditorProvider);

var _prosemirrorState = require('prosemirror-state');

var _prosemirrorView = require('prosemirror-view');

var _clipboard = require('../schema/setup/clipboard');

var _configure = require('../schema/editable/configure');

var _configure2 = _interopRequireDefault(_configure);

var _autocompleteConfig = require('../addons/Autocomplete/autocompleteConfig');

var _schema = require('../schema');

var _setup = require('../schema/setup');

var _plugins = require('../schema/plugins');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var Editor = _react2.default.createClass({
	displayName: 'Editor',

	propTypes: {
		initialContent: _react.PropTypes.object,
		onChange: _react.PropTypes.func,
		handleFileUpload: _react.PropTypes.func,
		handleReferenceAdd: _react.PropTypes.func,
		trackChanges: _react.PropTypes.bool
	},

	getInitialState: function getInitialState() {
		return {};
	},
	componentWillMount: function componentWillMount() {},
	componentDidMount: function componentDidMount() {
		this.createEditor();
	},
	componentDidUpdate: function componentDidUpdate(prevProps, prevState) {
		if (prevProps.editorKey !== this.props.editorKey) {
			this.createEditor();
		}
	},
	onChange: function onChange() {
		this.props.onChange(this.view.state.doc.toJSON());
	},
	getJSON: function getJSON() {
		return this.editor.toJSON();
	},
	configurePlugins: function configurePlugins() {
		var trackChanges = this.props.trackChanges;

		var schema = (0, _schema.createSchema)();

		var plugins = (0, _setup.getBasePlugins)({ schema: schema });
		var _iteratorNormalCompletion = true;
		var _didIteratorError = false;
		var _iteratorError = undefined;

		try {
			for (var _iterator = this.props.children[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
				var child = _step.value;

				if (child.type.getPlugins) {
					plugins = plugins.concat(child.type.getPlugins(child.props));
				}
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

		if (trackChanges) {
			plugins = plugins.concat(TrackPlugin);
		}

		return plugins;
	},
	createEditor: function createEditor() {
		var _props;

		if (this.view) {
			this.remove();
		}

		// const place = ReactDOM.findDOMNode(this.refs.container);
		var schema = (0, _schema.createSchema)();
		var place = document.getElementById('pubEditor');

		var contents = this.props.initialContent;
		var plugins = this.configurePlugins();

		var config = {
			referencesList: this.props.localFiles,
			trackChanges: this.props.trackChanges,
			rebaseChanges: this.props.rebaseChanges,
			updateCommits: this.props.updateCommits
		};

		var stateConfig = _extends({
			doc: contents ? schema.nodeFromJSON(contents) : schema.nodes.doc.create(),
			schema: schema,
			plugins: plugins
		}, config);

		var _configureClipboard = (0, _clipboard.configureClipboard)({ schema: schema }),
		    clipboardParser = _configureClipboard.clipboardParser,
		    clipboardSerializer = _configureClipboard.clipboardSerializer,
		    transformPastedHTML = _configureClipboard.transformPastedHTML;

		var state = _prosemirrorState.EditorState.create(stateConfig);
		var editorView = document.createElement('div');
		editorView.className = 'pub-body';
		place.appendChild(editorView);

		var props = (_props = {
			referencesList: this.props.localFiles,
			createFile: this.props.handleFileUpload,
			createReference: this.props.handleReferenceAdd,
			captureError: this.props.onError,
			onChange: this.onChange,
			updateCommits: this.props.updateCommits
		}, _defineProperty(_props, 'createFile', this.props.handleFileUpload), _defineProperty(_props, 'captureError', this.props.onError), _defineProperty(_props, 'updateMentions', this.updateMentions), _props);

		this.view = new _prosemirrorView.EditorView(editorView, _extends({
			state: state,
			dispatchTransaction: this._onAction,
			spellcheck: true,
			clipboardSerializer: clipboardSerializer,
			transformPastedHTML: transformPastedHTML,
			handleDOMEvents: {
				dragstart: function dragstart(view, evt) {
					evt.preventDefault();
					return true;
				}
			},
			viewHandlers: {
				updateMentions: this.updateMentions
			},
			nodeViews: _configure2.default
		}, props));

		this.setState({ view: this.view, editorState: state });
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

	remove: function remove() {
		if (this.view) {
			this.view.destroy();
		}
	},
	getMentionPos: function getMentionPos() {
		var mentionsPlugin = void 0;
		if (mentionsPlugin = (0, _plugins.getPlugin)('mentions', this.view.state)) {
			return mentionsPlugin.props.getMentionPos(this.view);
		}
		return null;
	},
	getTrackedSteps: function getTrackedSteps() {
		var trackPlugin = void 0;
		if (trackPlugin = (0, _plugins.getPlugin)('track', this.view.state)) {
			var steps = trackPlugin.props.getTrackedSteps.bind(trackPlugin)(this.view);
			return steps;
		}
		return null;
	},
	rebaseSteps: function rebaseSteps(steps) {
		var rebasePlugin = void 0;
		if (rebasePlugin = (0, _plugins.getPlugin)('rebase', this.view.state)) {
			return rebasePlugin.props.rebaseSteps.bind(rebasePlugin)(this.view, steps);
		}
		return Promise.resolve(null);
	},
	rebase: function rebase(forkID) {
		var firebasePlugin = void 0;
		if (firebasePlugin = (0, _plugins.getPlugin)('firebase', this.view.state)) {
			return firebasePlugin.props.rebase.bind(firebasePlugin)(forkID);
		}
		return Promise.resolve(null);
	},
	rebaseByCommit: function rebaseByCommit(forkID) {
		var firebasePlugin = void 0;
		if (firebasePlugin = (0, _plugins.getPlugin)('firebase', this.view.state)) {
			return firebasePlugin.props.rebaseByCommit.bind(firebasePlugin)(forkID);
		}
		return Promise.resolve(null);
	},
	commit: function commit(msg) {
		var firebasePlugin = void 0;
		if (firebasePlugin = (0, _plugins.getPlugin)('firebase', this.view.state)) {
			return firebasePlugin.props.commit.bind(firebasePlugin)(msg);
		}
		return Promise.resolve(null);
	},
	_onAction: function _onAction(transaction) {
		if (!this.view || !this.view.state) {
			return;
		}
		var newState = this.view.state.apply(transaction);
		this.view.updateState(newState);
		this.setState({ editorState: newState, transaction: transaction });
	},


	render: function render() {

		return _react2.default.createElement(
			'div',
			{ style: { position: 'relative', width: '100%', minHeight: 250 }, id: 'rich-editor-container' },
			this.state.view ? _react2.default.createElement(
				_EditorProvider2.default,
				{ view: this.state.view, editorState: this.state.editorState, transaction: this.state.transaction, containerId: 'rich-editor-container' },
				this.props.children
			) : null,
			_react2.default.createElement('div', { className: 'pubEditor', id: 'pubEditor' })
		);
	}

});

exports.default = Editor;