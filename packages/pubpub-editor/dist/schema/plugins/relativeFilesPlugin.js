'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _prosemirrorState = require('prosemirror-state');

var _pluginKeys = require('./pluginKeys');

var RelativeFilesPlugin = new _prosemirrorState.Plugin({
	state: {
		init: function init(config, instance) {
			return { fileMap: config.fileMap || {} };
		},
		apply: function apply(transaction, state, prevEditorState, editorState) {
			var uploadedFile = void 0;
			if (uploadedFile = transaction.getMeta('uploadedFile')) {
				var fileMap = state.fileMap;
				fileMap[uploadedFile.filename] = uploadedFile.url;
				return { fileMap: fileMap };
			}
			return state;
		}
	},
	view: function view(editorView) {
		var _this = this;

		this.editorView = editorView;
		return {
			update: function update(newView, prevState) {
				_this.editorView = newView;
			},
			destroy: function destroy() {
				_this.editorView = null;
			}
		};
	},
	props: {
		getFile: function getFile(_ref) {
			var filename = _ref.filename,
			    state = _ref.state;

			var pluginState = void 0;
			if (pluginState = state && this.getState(state)) {
				var file = pluginState.fileMap[filename];
				return file;
			}
			return null;
		},
		getAllFiles: function getAllFiles(_ref2) {
			var state = _ref2.state;

			var pluginState = void 0;
			if (pluginState = state && this.getState(state)) {
				var files = pluginState.fileMap;
				return files;
			}
			return null;
		}
	},
	key: _pluginKeys.keys.relativefiles
});

exports.default = RelativeFilesPlugin;