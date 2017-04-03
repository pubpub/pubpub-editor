'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _docOperations = require('../../utils/doc-operations');

var _references = require('../../references');

var _prosemirrorState = require('prosemirror-state');

var _prosemirrorModel = require('prosemirror-model');

var _prosemirrorTransform = require('prosemirror-transform');

var _pluginKeys = require('./pluginKeys');

var _schema = require('../schema');

var _require = require('prosemirror-view'),
    DecorationSet = _require.DecorationSet,
    Decoration = _require.Decoration;

/*
Problem:
	- problem: remote diffs do not have meta data
*/

var createReferenceDecoration = function createReferenceDecoration(index, node, label) {
	return Decoration.node(index, index + 1, {}, { citationID: node.attrs.citationID, label: label });
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
			transaction.setMeta('deleteReference', citationID);
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
		if (label) {
			var deco = createReferenceDecoration(node.index, node.node, label);
			return deco;
		}
		return null;
	});
	var newSet = DecorationSet.create(doc, decos);
	return newSet;
};

var createReference = function createReference(citationData, state, engine) {
	// const randomCitationId = (!citationData.id || isNaN(citationData.id)) ? Math.round(Math.random()*100000000) : citationData.id;

	var referenceNode = _schema.schema.nodes.reference.create({ citationID: citationData.id });
	// citationData.id = randomCitationId;

	/*
 const newNode = schema.nodes.citation.create({data: citationData, citationID: randomCitationId});
 const citationsNode = findNodesWithIndex(state.doc, 'citations');
 const pos = citationsNode[0].index + 1;
 const newPoint = insertPoint(state.doc, pos, schema.nodes.citation, {data: citationData});
 let tr = state.tr.insert(newPoint, newNode);
 */

	var tr = state.tr.replaceSelectionWith(referenceNode);
	tr.setMeta('createdReference', { node: referenceNode });

	engine.addCitation(citationData);

	return tr;
};

var createCitations = function createCitations() {};

var createCitation = function createCitation(citationData, state, engine) {
	var newNode = _schema.schema.nodes.citation.create({ data: citationData, citationID: citationData.id });
	var citationsNode = (0, _docOperations.findNodesWithIndex)(state.doc, 'citations');
	var pos = citationsNode[0].index + 1;
	var newPoint = (0, _prosemirrorTransform.insertPoint)(state.doc, pos, _schema.schema.nodes.citation, { data: citationData });
	var tr = state.tr.insert(newPoint, newNode);
	tr.setMeta('createCitation', citationData);
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

var getAllCitationData = function getAllCitationData(doc) {
	var citationNodes = (0, _docOperations.findNodesWithIndex)(doc, 'citation') || [];
	var citationData = citationNodes.map(function (node) {
		return node.node.attrs ? node.node.attrs.data : null;
	});
	return citationData;
};

var getReferences = function getReferences(engine, doc, decorations) {
	var citationNodes = (0, _docOperations.findNodesWithIndex)(doc, 'citation') || [];
	var citationData = citationNodes.map(function (node) {
		return node.node.attrs ? node.node.attrs.data : null;
	});
	engine.setBibliography(citationData);
	// Create deocrations for references
	return createDecorations(doc, decorations, engine);
};

/*
Citations Plugin:

	- citaitons are stored in the document, but only the ID and order
	- these citations are re-inserted every time there's a new file/rebuilt from markdown serialzation
	- actual citation information is stored in the meta data of the document
*/

var citationsPlugin = new _prosemirrorState.Plugin({
	state: {
		init: function init(config, instance) {
			var existingCitations = getAllCitationData(instance.doc);
			var engine = new _references.CitationEngine();
			var referencesList = config.referencesList.concat(existingCitations);
			engine.setBibliography(referencesList);
			// const set = createAllCitations(engine, instance.doc, DecorationSet.empty);
			var set = createDecorations(instance.doc, DecorationSet.empty, engine);
			return {
				decos: set,
				engine: engine,
				referencesList: referencesList
			};
		},
		apply: function apply(transaction, state, prevEditorState, editorState) {
			var _this = this;

			/*
   if (transaction.getMeta('docReset')) {
   	const newSet = createAllCitations(state.engine, editorState.doc, state.decos);
   	return {decos: newSet, engine: state.engine};
   }
   */

			if (transaction.getMeta('createReference')) {
				var citationData = transaction.getMeta('createReference');
				state.engine.addCitation(citationData);
			}

			var set = state.decos;
			if (transaction.getMeta('createReference') || transaction.getMeta('deleteReference')) {
				var blueSet = createDecorations(editorState.doc, state.decos, state.engine);
				return { decos: blueSet, engine: state.engine };
			} else if (transaction.mapping) {
				var newSet = set.map(transaction.mapping, editorState.doc, { onRemove: function onRemove(deco) {
						removeDecoration(deco.citationID, state.engine, _this.spec.view);
					} });
				return { decos: newSet, engine: state.engine };
			}

			return { decos: set, engine: state.engine };
		}
	},
	view: function view(editorView) {
		var _this2 = this;

		this.editorView = editorView;
		return {
			update: function update(newView, prevState) {
				_this2.editorView = newView;
			},
			destroy: function destroy() {
				_this2.editorView = null;
			}
		};
	},

	appendTransaction: function appendTransaction(transactions, oldState, newState) {
		var firstTransaction = transactions[0];
		if (!firstTransaction) {
			return;
		}
		var citationData = void 0;
		if (citationData = firstTransaction.getMeta('createCitation')) {
			var pluginState = this.getState(newState);
			return createReference(citationData, newState, pluginState.engine, start, end);
		}
		return null;
	},
	props: {
		getCitationString: function getCitationString(state, citationID) {
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