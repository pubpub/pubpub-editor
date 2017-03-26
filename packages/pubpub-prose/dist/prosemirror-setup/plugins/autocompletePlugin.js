'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _prosemirrorState = require('prosemirror-state');

var _docOperations = require('../utils/doc-operations');

var _prosemirrorTransform = require('prosemirror-transform');

var _pluginKeys = require('./pluginKeys');

var _setup = require('../setup');

var _require = require("prosemirror-view"),
    DecorationSet = _require.DecorationSet,
    Decoration = _require.Decoration;

var autocompletePlugin = new _prosemirrorState.Plugin({
  state: {
    // Need to parse citations at the bottom of the document
    init: function init(config, instance) {
      return {};
    },
    apply: function apply(action, state, prevEditorState, editorState) {
      return state;
    }
  },
  props: {
    decorations: function decorations(state) {
      if (state && this.getState(state) && this.getState(state).decos) {
        return this.getState(state).decos;
      }
      return null;
    },
    createCitation: function createCitation(state, onAction, citationData) {
      var referenceNode = _setup.schema.nodes.reference.create({
        citationID: '1'
      });
      var newNode = _setup.schema.nodes.citation.create({ data: citationData });

      var citationsNode = (0, _docOperations.findNodesWithIndex)(state.doc, 'citations');

      var pos = citationsNode[0].index + 1;

      // tries to find the closest place to insert this note
      var newPoint = (0, _prosemirrorTransform.insertPoint)(state.doc, pos, _setup.schema.nodes.citation, { data: citationData });
      var tr = state.tr.insert(newPoint, newNode);

      tr = tr.replaceSelectionWith(referenceNode);

      var action = tr.action();
      onAction(action);
    }
  },
  key: _pluginKeys.keys.citations
});

exports.default = autocompletePlugin;