'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.TrackAddon = undefined;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _prosemirrorState = require('prosemirror-state');

var _TrackChangesPlugin = require('./TrackChangesPlugin');

var _TrackChangesPlugin2 = _interopRequireDefault(_TrackChangesPlugin);

var _prosemirrorCollab = require('prosemirror-collab');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectDestructuringEmpty(obj) { if (obj == null) throw new TypeError("Cannot destructure undefined"); }

var styles = void 0;

var firebaseKey = new _prosemirrorState.PluginKey('firebase');

var TrackAddon = exports.TrackAddon = _react2.default.createClass({
	displayName: 'TrackAddon',

	propTypes: {
		containerId: _react2.default.PropTypes.string.isRequired,
		view: _react2.default.PropTypes.object.isRequired,
		editorState: _react2.default.PropTypes.object.isRequired,
		editorRef: _react2.default.PropTypes.object.isRequired,
		showCollaborators: _react2.default.PropTypes.bool.isRequired
	},
	statics: {
		getPlugins: function getPlugins(_ref) {
			_objectDestructuringEmpty(_ref);

			return [_TrackChangesPlugin2.default];
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

exports.default = TrackAddon;


styles = {};