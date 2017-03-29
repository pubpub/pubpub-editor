// import { Decoration, DecorationSet } from 'prosemirror-view';
import { Plugin } from 'prosemirror-state';
import { keys } from './pluginKeys';

const RelativeFilesPlugin = new Plugin({
	state: {
		init(config, instance) {
			console.log('GOT FILEMAP', config.fileMap);
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
