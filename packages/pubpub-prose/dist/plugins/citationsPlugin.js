'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _docOperations = require('../utils/doc-operations');

var _references = require('../references');

var _prosemirrorState = require('prosemirror-state');

var _prosemirrorModel = require('prosemirror-model');

var _prosemirrorTransform = require('prosemirror-transform');

var _pluginKeys = require('./pluginKeys');

var _setup = require('../setup');

var _require = require("prosemirror-view"),
    DecorationSet = _require.DecorationSet,
    Decoration = _require.Decoration;

/*
Problem:
  - problem: remote diffs do not have meta data
*/

var createReferenceDecoration = function createReferenceDecoration(index, node, label) {
  return Decoration.node(index, index + 1, { class: 'diff-marker add' }, { citationID: node.attrs.citationID, label: label });
};

// need to check if there are other references with nodes?
var removeDecoration = function removeDecoration(citationID, engine, state) {
  return;
  engine.removeCitation(citationID);
  var removeNodePos = (0, _docOperations.findNodeByAttr)(state.doc, 'citationID', citationID);
  var transaction = state.tr.replaceRange(removeNodePos.index, removeNodePos.index + 1, _prosemirrorModel.Slice.empty);
};

var createDecorations = function createDecorations(doc, set, engine) {
  var nodes = (0, _docOperations.findNodesWithIndex)(doc, 'reference') || [];
  var decos = nodes.map(function (node) {
    var label = engine.getShortForm(node.node.attrs.citationID);
    var deco = createReferenceDecoration(node.index, node.node, label);
    return deco;
  });
  var newSet = DecorationSet.create(doc, decos);
  return newSet;
};

var createReference = function createReference(citationData, state, engine) {
  var randomCitationId = !citationData.id || isNaN(citationData.id) ? Math.round(Math.random() * 100000000) : citationData.id;
  var randomReferenceId = Math.round(Math.random() * 100000000);

  var referenceNode = _setup.schema.nodes.reference.create({
    citationID: randomCitationId,
    referenceID: randomReferenceId
  });
  citationData.id = randomCitationId;

  var newNode = _setup.schema.nodes.citation.create({ data: citationData, citationID: randomCitationId });
  var citationsNode = (0, _docOperations.findNodesWithIndex)(state.doc, 'citations');
  var pos = citationsNode[0].index + 1;

  // tries to find the closest place to insert this note
  var newPoint = (0, _prosemirrorTransform.insertPoint)(state.doc, pos, _setup.schema.nodes.citation, { data: citationData });
  var tr = state.tr.insert(newPoint, newNode);

  tr = tr.replaceSelectionWith(referenceNode);
  tr.setMeta("createdReference", { node: referenceNode, index: newPoint });

  engine.addCitation(citationData);

  return tr;
};

var createAllCitations = function createAllCitations(engine, doc, decorations) {
  var citationNodes = (0, _docOperations.findNodesWithIndex)(doc, 'citation') || [];
  var citationData = citationNodes.map(function (node) {
    return node.node.attrs ? node.node.attrs.data : null;
  });
  engine.setBibliography(citationData);
  // Create deocrations for references
  return createDecorations(doc, decorations, engine);
};

var citationsPlugin = new _prosemirrorState.Plugin({
  state: {
    // Need to parse citations at the bottom of the document
    init: function init(config, instance) {
      var engine = new _references.CitationEngine();
      var set = createAllCitations(engine, instance.doc, DecorationSet.empty);
      return {
        decos: set,
        engine: engine
      };
    },
    apply: function apply(transaction, state, prevEditorState, editorState) {

      if (transaction.getMeta("docReset")) {

        var newSet = createAllCitations(state.engine, editorState, state.decos);
        return { decos: newSet, engine: state.engine };
      }

      var set = state.decos;
      var createdRef = void 0;
      if (createdRef = transaction.getMeta("createdReference")) {
        var blueSet = createDecorations(editorState.doc, state.decos, state.engine);
        return { decos: blueSet, engine: state.engine };
      } else if (transaction.mapping) {
        var _newSet = set.map(transaction.mapping, editorState.doc, { onRemove: function onRemove(deco) {
            removeDecoration(deco.citationID, state.engine, editorState);
          } });
        return { decos: _newSet, engine: state.engine };
      }

      return { decos: set, engine: state.engine };
    }
  },
  appendTransaction: function appendTransaction(transactions, oldState, newState) {
    var firstTransaction = transactions[0];
    if (!firstTransaction) {
      return;
    }
    var citationData = void 0;
    if (citationData = firstTransaction.getMeta("createCitation")) {
      var pluginState = this.getState(newState);
      return createReference(citationData, newState, pluginState.engine);
    }
    return null;
  },

  props: {
    getBibliography: function getBibliography(state, citationData, citationIDs) {
      if (state && this.getState(state)) {
        var engine = this.getState(state).engine;
        if (citationData) {
          engine.setBibliography(citationData);
        }
        return engine.getBibliography(citationIDs);
      }
    },
    decorations: function decorations(state) {
      if (state && this.getState(state) && this.getState(state).decos) {
        return this.getState(state).decos;
      }
      return null;
    }
  },
  key: _pluginKeys.keys.citations
});

exports.default = citationsPlugin;