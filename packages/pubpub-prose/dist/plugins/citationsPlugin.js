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

var findCitationNode = function findCitationNode(doc, citationID) {
  var citationsNode = doc.child(1);
  if (!citationsNode) {
    return null;
  }
  var foundNode = (0, _docOperations.findNodeByFunc)(doc, function (_node) {
    return _node.attrs.citationID === citationID;
  });
  if (!foundNode) {
    return null;
  }
  var from = foundNode.index + 1;
  var to = from + foundNode.node.nodeSize;
  return { from: from, to: to };
};

// need to check if there are other references with nodes?
var removeDecoration = function removeDecoration(citationID, engine, view) {
  // engine.removeCitation(citationID);

  // NEED TO CHECK IF THERE ARE OTHERS

  var action = function action() {
    var doc = view.state.doc;
    var foundNodePos = findCitationNode(doc, citationID);
    if (foundNodePos) {
      var transaction = view.state.tr.delete(foundNodePos.from, foundNodePos.to);
      transaction.setMeta("deleteReference", citationID);
      view.dispatch(transaction);
    }
  };

  window.setTimeout(action, 0);
  return;
};

var createDecorations = function createDecorations(doc, set, engine) {
  var nodes = (0, _docOperations.findNodesWithIndex)(doc, 'reference') || [];
  var decos = nodes.map(function (node) {
    var label = engine.getShortForm(node.node.attrs.citationID);
    console.log('label', label, node.node.attrs.citationID);
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
      var _this = this;

      if (transaction.getMeta("docReset")) {

        var newSet = createAllCitations(state.engine, editorState, state.decos);
        return { decos: newSet, engine: state.engine };
      }

      var set = state.decos;
      if (transaction.getMeta("createdReference") || transaction.getMeta("deleteReference")) {
        console.log('updating all refs');
        var blueSet = createDecorations(editorState.doc, state.decos, state.engine);
        return { decos: blueSet, engine: state.engine };
      } else if (transaction.mapping) {
        var _newSet = set.map(transaction.mapping, editorState.doc, { onRemove: function onRemove(deco) {
            removeDecoration(deco.citationID, state.engine, _this.options.view);
          } });
        return { decos: _newSet, engine: state.engine };
      }

      return { decos: set, engine: state.engine };
    }
  },
  view: function view(editorView) {
    var _this2 = this;

    this.view = editorView;
    return {
      update: function update(newView, prevState) {
        _this2.view = newView;
      },
      destroy: function destroy() {
        _this2.view = null;
      }
    };
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
    getCitationString: function getCitationString(state, citationID, citationData) {
      if (state && this.getState(state)) {
        var engine = this.getState(state).engine;
        return engine.getSingleBibliography(citationID);
      }
    },
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