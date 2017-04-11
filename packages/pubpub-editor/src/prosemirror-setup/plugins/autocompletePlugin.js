import { Plugin } from 'prosemirror-state';
import { findNodesWithIndex } from '../utils/doc-operations';
import { insertPoint } from 'prosemirror-transform';
import { keys } from './pluginKeys';
import { schema } from '../schema';

const { DecorationSet, Decoration } = require("prosemirror-view");

const autocompletePlugin = new Plugin({
  state: {
    // Need to parse citations at the bottom of the document
    init(config, instance) {
      return {};
    },
    apply(action, state, prevEditorState, editorState) {
      return state;
    }
  },
  props: {
    decorations(state) {
      if (state && this.getState(state) && this.getState(state).decos) {
        return this.getState(state).decos;
      }
      return null;
    },
    createCitation(state, onAction, citationData) {
      const referenceNode = schema.nodes.reference.create({
        citationID: '1',
      });
      const newNode = schema.nodes.citation.create({data: citationData});

      const citationsNode = findNodesWithIndex(state.doc, 'citations');

      const pos = citationsNode[0].index + 1;

      // tries to find the closest place to insert this note
      const newPoint = insertPoint(state.doc, pos, schema.nodes.citation, {data: citationData});
      let tr = state.tr.insert(newPoint, newNode);

      tr = tr.replaceSelectionWith(referenceNode);

      const action = tr.action();
      onAction(action);
    }
  },
  key: keys.citations
});

export default autocompletePlugin;
