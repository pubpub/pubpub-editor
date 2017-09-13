import { findNodeByAttr, findNodeByFunc, findNodesByFunc, findNodesWithIndex } from '../../utils/doc-operations';

import { CitationEngine } from '../../references';
import { Plugin } from 'prosemirror-state';
import { Slice } from 'prosemirror-model';
import { getPluginState } from '../plugins';
import { insertPoint } from 'prosemirror-transform';
import { keys } from './pluginKeys';
import { schema } from '../schema';

const { DecorationSet, Decoration } = require('prosemirror-view');

const createReferenceDecoration = (index, node, label) => {
	return Decoration.node(index , index + 1, {}, { citationID: node.attrs.citationID, label });
}

const findCitationNode = (doc, citationID) => {
	const citationsNode = doc.child(1);
	if (!citationsNode) {
		return null;
	}
	let foundNode = findNodeByFunc(doc, (_node) => (_node.type.name === 'citation' && _node.attrs.citationID === citationID));
	if (!foundNode) {
		return null;
	}
	const from = foundNode.index;
	const to = from + foundNode.node.nodeSize;
	return { from, to };
}

const removeDecoration = (citationID, engine, view) => {
	const action = () => {
		const doc = view.state.doc;
		const foundNodePos = findCitationNode(doc, citationID);
		const countReferences = findNodesByFunc(doc, (_node) => (_node.type.name === 'reference' && _node.attrs.citationID === citationID));

		if (foundNodePos && countReferences.length === 0) {
			const transaction = view.state.tr.deleteRange(foundNodePos.from, foundNodePos.to);
			transaction.setMeta('deleteReference', citationID);
			view.dispatch(transaction);
		}
	}
	window.setTimeout(action, 0);
	return;
}

const createDecorations = (doc, set, engine) => {
	const nodes = findNodesWithIndex(doc, 'reference') || [];
	const decos = nodes.map((node, index) => {
		const citationID = node.node.attrs.citationID;
		const label = engine.getShortForm(citationID);
		if (label) {
			const deco = createReferenceDecoration(node.index, node.node, label);
			return deco;
		}
		return null;
	});

	const newSet = DecorationSet.create(doc, decos);
	return newSet;
}


const createReference = (citationData, state, engine) => {
	const citationID = citationData.id;
	const newNode = schema.nodes.citation.create({data: citationData, citationID });
	const citationsNode = findNodesWithIndex(state.doc, 'citations');
	const pos = citationsNode[0].index + 1;

	// tries to find the closest place to insert this note
	const newPoint = insertPoint(state.doc, pos, schema.nodes.citation, {data: citationData});
	let tr = state.tr.insert(newPoint, newNode);
	tr.setMeta('createdReference', citationID);
	engine.addCitation(citationData);
	return tr;
}

const createAllCitations = (engine, doc, decorations) => {
	const citationNodes = findNodesWithIndex(doc, 'citation') || [];
	const citationData = citationNodes.map((node) => {
		return (node.node.attrs) ? node.node.attrs.data : null;
	});
	engine.setBibliography(citationData);
	// Create deocrations for references
	return createDecorations(doc, decorations, engine);
}


const citationsPlugin = new Plugin({
	state: {
		init(config, instance) {
			const engine = new CitationEngine();
			const set = createAllCitations(engine, instance.doc, DecorationSet.empty);
			return {
				decos: set,
				engine: engine
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

			if (transaction.getMeta('createdReference') || transaction.getMeta('deleteReference') || transaction.getMeta('history$')) {
				const blueSet = createDecorations(editorState.doc, state.decos, state.engine);
				return {decos: blueSet, engine: state.engine};
			} else if (transaction.mapping) {
				const newSet = set.map(transaction.mapping, editorState.doc,
					{ onRemove: (deco) => { removeDecoration(deco.citationID, state.engine, this.spec.editorView) } });
				return {decos: newSet, engine: state.engine};
			}

			return {decos: set, engine: state.engine};
		}
	},
	view: function(editorView) {
		this.editorView = editorView;
		const pluginState = getPluginState('citations', editorView.state);
		const notFound = pluginState.engine.getMissingCitations(editorView.props.referencesList);
		for (const notFoundCitation of notFound) {
			editorView.props.createReference(notFoundCitation);
		}
		return {
			update: (newView, prevState) => {
				this.editorView = newView;
			},
			destroy: () => {
				this.editorView = null;
			}
		}
	},

	appendTransaction: function (transactions, oldState, newState) {
		const firstTransaction = transactions[0];
		if (!firstTransaction) {
			return;
		}
		let citationData;
		if (citationData = firstTransaction.getMeta('createReference')) {
			const pluginState = this.getState(newState);
			return createReference(citationData, newState, pluginState.engine);
		}
		return null;
	},

	props: {
		getNewCitations(state, allReferences) {
			if (state && this.getState(state)) {
				const engine = this.getState(state).engine;
			}
		},
		getCitationString(state, citationID) {
			if (state && this.getState(state)) {
				const engine = this.getState(state).engine;
				return engine.getSingleBibliography(citationID);
			}
		},
		getBibliography(state, citationData, citationIDs) {
			if (state && this.getState(state)) {
				const engine = this.getState(state).engine;
				if (citationData) {
					engine.setBibliography(citationData);
				}
				return engine.getBibliography(citationIDs);
			}
		},
		decorations(state) {
			if (state && this.getState(state) && this.getState(state).decos) {
				return this.getState(state).decos;
			}
			return null;
		},
	},
	key: keys.citations
});

export default citationsPlugin;
