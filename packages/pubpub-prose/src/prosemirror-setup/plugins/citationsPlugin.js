import { findNodeByAttr, findNodeByFunc, findNodesWithIndex } from '../../utils/doc-operations';

import { CitationEngine } from '../../references';
import { Plugin } from 'prosemirror-state';
import { Slice } from 'prosemirror-model';
import { insertPoint } from 'prosemirror-transform';
import { keys } from './pluginKeys';
import { schema } from '../schema';

const { DecorationSet, Decoration } = require('prosemirror-view');

/*
Problem:
	- problem: remote diffs do not have meta data
*/


const createReferenceDecoration = (index, node, label) => {
	return Decoration.node(index , index + 1, {}, { citationID: node.attrs.citationID, label });
}

const findCitationNode = (doc, citationID) => {
	const citationsNode = doc.child(1);
	if (!citationsNode) {
		return null;
	}
	let foundNode = findNodeByFunc(doc, (_node) => (_node.attrs.citationID === citationID));
	if (!foundNode) {
		return null;
	}
	const from = foundNode.index + 1;
	const to = from + foundNode.node.nodeSize;
	return {from, to};
}


// need to check if there are other references with nodes?
const removeDecoration = (citationID, engine, view) => {
	// engine.removeCitation(citationID);

	// NEED TO CHECK IF THERE ARE OTHERS

	const action = () => {
		const doc = view.state.doc;
		const foundNodePos = findCitationNode(doc, citationID);
		if (foundNodePos) {
			const transaction = view.state.tr.delete(foundNodePos.from, foundNodePos.to);
			transaction.setMeta('deleteReference', citationID);
			view.dispatch(transaction);
		}
	}

	window.setTimeout(action, 0);
	return;

}

const createDecorations = (doc, set, engine) => {
	const nodes = findNodesWithIndex(doc, 'reference') || [];
	const decos = nodes.map((node) => {
		const label = engine.getShortForm(node.node.attrs.citationID);
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
	// const randomCitationId = (!citationData.id || isNaN(citationData.id)) ? Math.round(Math.random()*100000000) : citationData.id;

	const referenceNode = schema.nodes.reference.create({ citationID: citationData.id });
	// citationData.id = randomCitationId;

	/*
	const newNode = schema.nodes.citation.create({data: citationData, citationID: randomCitationId});
	const citationsNode = findNodesWithIndex(state.doc, 'citations');
	const pos = citationsNode[0].index + 1;
	const newPoint = insertPoint(state.doc, pos, schema.nodes.citation, {data: citationData});
	let tr = state.tr.insert(newPoint, newNode);
	*/

	let tr = state.tr.replaceSelectionWith(referenceNode);
	tr.setMeta('createdReference', {node: referenceNode});

	engine.addCitation(citationData);

	return tr;
}

const createCitations = () => {

}


const createCitation = (citationData, state, engine) => {
	const newNode = schema.nodes.citation.create({ data: citationData, citationID: citationData.id });
	const citationsNode = findNodesWithIndex(state.doc, 'citations');
	const pos = citationsNode[0].index + 1;
	const newPoint = insertPoint(state.doc, pos, schema.nodes.citation, {data: citationData});
	let tr = state.tr.insert(newPoint, newNode);
	tr.setMeta('createCitation', citationData);
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


const getAllCitationData = (doc) => {
	const citationNodes = findNodesWithIndex(doc, 'citation') || [];
	const citationData = citationNodes.map((node) => {
		return (node.node.attrs) ? node.node.attrs.data : null;
	});
	return citationData;
}


const getReferences = (engine, doc, decorations) => {
	const citationNodes = findNodesWithIndex(doc, 'citation') || [];
	const citationData = citationNodes.map((node) => {
		return (node.node.attrs) ? node.node.attrs.data : null;
	});
	engine.setBibliography(citationData);
	// Create deocrations for references
	return createDecorations(doc, decorations, engine);
}

/*
Citations Plugin:

	- citaitons are stored in the document, but only the ID and order
	- these citations are re-inserted every time there's a new file/rebuilt from markdown serialzation
	- actual citation information is stored in the meta data of the document
*/

const citationsPlugin = new Plugin({
	state: {
		init(config, instance) {
			const existingCitations = getAllCitationData(instance.doc);
			const engine = new CitationEngine();
			const referencesList = config.referencesList.concat(existingCitations);
			engine.setBibliography(referencesList);
			// const set = createAllCitations(engine, instance.doc, DecorationSet.empty);
			const set = createDecorations(instance.doc, DecorationSet.empty, engine);
			return {
				decos: set,
				engine: engine,
				referencesList: referencesList,
			};
		},
		apply(transaction, state, prevEditorState, editorState) {

			/*
			if (transaction.getMeta('docReset')) {
				const newSet = createAllCitations(state.engine, editorState.doc, state.decos);
				return {decos: newSet, engine: state.engine};
			}
			*/

			if (transaction.getMeta('createReference')) {
				const citationData = transaction.getMeta('createReference');
				state.engine.addCitation(citationData);
			}

			let set = state.decos;
			if (transaction.getMeta('createReference') || transaction.getMeta('deleteReference')) {
				const blueSet = createDecorations(editorState.doc, state.decos, state.engine);
				return {decos: blueSet, engine: state.engine};
			} else if (transaction.mapping) {
				const newSet = set.map(transaction.mapping, editorState.doc,
					{ onRemove: (deco) => { removeDecoration(deco.citationID, state.engine, this.spec.view) } });
				return {decos: newSet, engine: state.engine};
			}

			return { decos: set, engine: state.engine };
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
		}
	},

	appendTransaction: function (transactions, oldState, newState)  {
		const firstTransaction = transactions[0];
		if (!firstTransaction) {
			return;
		}
		let citationData;
		if (citationData = firstTransaction.getMeta('createCitation')) {
			const pluginState = this.getState(newState);
			return createReference(citationData, newState, pluginState.engine, start, end);
		}
		return null;
	},
	props: {
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
