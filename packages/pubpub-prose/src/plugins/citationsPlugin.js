import { findNodeByAttr, findNodeByFunc, findNodesWithIndex } from '../utils/doc-operations';

import { CitationEngine } from '../references';
import { Plugin } from 'prosemirror-state';
import { Slice } from 'prosemirror-model';
import { insertPoint } from 'prosemirror-transform';
import { keys } from './pluginKeys';
import { schema } from '../setup';

const { DecorationSet, Decoration } = require("prosemirror-view");

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
      transaction.setMeta("deleteReference", citationID);
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
  const randomCitationId = (!citationData.id || isNaN(citationData.id)) ? Math.round(Math.random()*100000000) : citationData.id;
  const randomReferenceId = Math.round(Math.random() * 100000000);

  const referenceNode = schema.nodes.reference.create({
    citationID: randomCitationId,
    referenceID: randomReferenceId,
  });
  citationData.id = randomCitationId;

  const newNode = schema.nodes.citation.create({data: citationData, citationID: randomCitationId});
  const citationsNode = findNodesWithIndex(state.doc, 'citations');
  const pos = citationsNode[0].index + 1;

  // tries to find the closest place to insert this note
  const newPoint = insertPoint(state.doc, pos, schema.nodes.citation, {data: citationData});
  let tr = state.tr.insert(newPoint, newNode);

  tr = tr.replaceSelectionWith(referenceNode);
  tr.setMeta("createdReference", {node: referenceNode, index: newPoint});

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
    // Need to parse citations at the bottom of the document
    init(config, instance) {
      const engine = new CitationEngine();
      const set = createAllCitations(engine, instance.doc, DecorationSet.empty);
      return {
        decos: set,
        engine: engine
      };
    },
    apply(transaction, state, prevEditorState, editorState) {

      if (transaction.getMeta("docReset")) {
        const newSet = createAllCitations(state.engine, editorState.doc, state.decos);
        return {decos: newSet, engine: state.engine};
			}

      let set = state.decos;
      if (transaction.getMeta("createdReference") || transaction.getMeta("deleteReference")) {
        const blueSet = createDecorations(editorState.doc, state.decos, state.engine);
        return {decos: blueSet, engine: state.engine};
      } else if (transaction.mapping) {
        const newSet = set.map(transaction.mapping, editorState.doc,
          { onRemove: (deco) => { removeDecoration(deco.citationID, state.engine, this.spec.view) } });
        return {decos: newSet, engine: state.engine};
      }

      return {decos: set, engine: state.engine};
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
    if (citationData = firstTransaction.getMeta("createCitation")) {
      const pluginState = this.getState(newState);
      return createReference(citationData, newState, pluginState.engine);
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
