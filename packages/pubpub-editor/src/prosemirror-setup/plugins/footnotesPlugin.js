import { findNodeByAttr, findNodeByFunc, findNodesByFunc, findNodesWithIndex } from '../../utils/doc-operations';

import { Plugin } from 'prosemirror-state';
import { Slice } from 'prosemirror-model';
import { getPluginState } from '../plugins';
import { insertPoint } from 'prosemirror-transform';
import { keys } from './pluginKeys';
import { schema } from '../schema';

const { DecorationSet, Decoration } = require('prosemirror-view');

const createFootnoteDecoration = (index, node, label) => {
	return Decoration.node(index , index + node.nodeSize, {}, { label });
}

const createDecorations = (doc, set) => {
	const nodes = findNodesWithIndex(doc, 'footnote') || [];
	let count = 0;
	const decos = nodes.map((node, index) => {
		count++;
		const deco = createFootnoteDecoration(node.index, node.node, count);
		return deco;
	});

	console.log('made decorations!', nodes, decos);

	const newSet = DecorationSet.create(doc, decos);
	return newSet;
}

const footnotesPlugin = new Plugin({
	state: {
		init(config, instance) {
			console.log('initializing footnotes!');
			const set = createDecorations(instance.doc, DecorationSet.empty);
			return {
				decos: set,
			};
		},
		apply(transaction, state, prevEditorState, editorState) {

			/*
			if (transaction.getMeta('docReset')) {
				const newSet = createAllCitations(state.engine, editorState.doc, state.decos);
				return {decos: newSet, engine: state.engine};
			}
			*/

			let set = state.decos;

			if (transaction.mapping || transaction.getMeta('history$')) {
				const blueSet = createDecorations(editorState.doc, state.decos);
				console.log(blueSet);
				return { decos: blueSet };
			}

			return { decos: set };
		}
	},


	props: {
		decorations(state) {
			if (state && this.getState(state) && this.getState(state).decos) {
				return this.getState(state).decos;
			}
			return null;
		},
	},
});

export default footnotesPlugin;
