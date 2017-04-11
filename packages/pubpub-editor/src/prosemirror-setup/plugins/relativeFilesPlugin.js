import { Plugin } from 'prosemirror-state';
import { keys } from './pluginKeys';

const RelativeFilesPlugin = new Plugin({
	state: {
		init(config, instance) {
			return { fileMap: config.fileMap || {} };
		},
		apply(transaction, state, prevEditorState, editorState) {
			let uploadedFile;
			if (uploadedFile = transaction.getMeta('uploadedFile')) {
				const fileMap = state.fileMap;
				fileMap[uploadedFile.filename] = uploadedFile.url;
				return { fileMap };
			}
			return state;
		}
	},
	view: function(editorView) {
		this.editorView = editorView;
		return {
			update: (newView, prevState) => {
				this.editorView = newView;
			},
			destroy: () => {
				this.editorView = null;
			}
		};
	},
	props: {
		getFile({ filename, state }) {
			let pluginState;
			if (pluginState = (state && this.getState(state))) {
				const file = pluginState.fileMap[filename];
				return file;
			}
			return null;
		},
		getAllFiles({ state }) {
			let pluginState;
			if (pluginState = (state && this.getState(state))) {
				const files = pluginState.fileMap;
				return files;
			}
			return null;
		},
	},
	key: keys.relativefiles
});

export default RelativeFilesPlugin;
