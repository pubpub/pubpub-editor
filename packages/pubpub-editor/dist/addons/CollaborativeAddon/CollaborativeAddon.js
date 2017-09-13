'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.CollaborativeAddon = undefined;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _FirebasePlugin = require('./FirebasePlugin');

var _FirebasePlugin2 = _interopRequireDefault(_FirebasePlugin);

var _prosemirrorState = require('prosemirror-state');

var _prosemirrorCollab = require('prosemirror-collab');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var styles = void 0;

var firebaseKey = new _prosemirrorState.PluginKey('firebase');

var CollaborativeAddon = exports.CollaborativeAddon = _react2.default.createClass({
	displayName: 'CollaborativeAddon',

	propTypes: {
		containerId: _react2.default.PropTypes.string.isRequired,
		view: _react2.default.PropTypes.object.isRequired,
		editorState: _react2.default.PropTypes.object.isRequired,
		editorRef: _react2.default.PropTypes.object.isRequired,
		showCollaborators: _react2.default.PropTypes.bool.isRequired
	},
	statics: {
		getPlugins: function getPlugins(_ref) {
			var firebaseConfig = _ref.firebaseConfig,
			    clientID = _ref.clientID,
			    editorKey = _ref.editorKey;

			return [(0, _FirebasePlugin2.default)({ selfClientID: clientID, editorKey: editorKey, firebaseConfig: firebaseConfig, pluginKey: firebaseKey }), (0, _prosemirrorCollab.collab)({ clientID: clientID })];
		}
	},
	getInitialState: function getInitialState() {
		return { collaborators: [] };
	},
	componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
		if (this.props.editorState !== nextProps.editorState) {
			this.onChange(nextProps);
		}
	},
	onChange: function onChange(props) {
		var editorState = props.editorState,
		    transaction = props.transaction;

		if (!editorState || !transaction) {
			return;
		}
		var firebasePlugin = firebaseKey.get(editorState);
		if (firebasePlugin) {
			if (!transaction.getMeta("rebase")) {
				return firebasePlugin.props.updateCollab(transaction, editorState);
			}
		}
	},
	fork: function fork(forkID) {
		var editorState = this.props.editorState;


		var firebasePlugin = void 0;
		if (firebasePlugin = firebaseKey.get(editorState)) {
			return firebasePlugin.props.fork.bind(firebasePlugin)(forkID);
		}
		return Promise.resolve(null);
	},
	getForks: function getForks() {
		var editorState = this.props.editorState;


		var firebasePlugin = void 0;
		if (firebasePlugin = firebaseKey.get(editorState)) {
			return firebasePlugin.props.getForks.bind(firebasePlugin)();
		}
		return Promise.resolve(null);
	},


	render: function render() {
		var _state = this.state,
		    top = _state.top,
		    left = _state.left;
		var view = this.props.view;


		if (!top || !editor || !view) {
			return null;
		}

		return _react2.default.createElement('div', null);
	}

});

exports.default = CollaborativeAddon;


styles = {};