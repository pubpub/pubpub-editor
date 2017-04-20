'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _docOperations = require('../../utils/doc-operations');

var _references = require('../../references');

var _prosemirrorState = require('prosemirror-state');

var _prosemirrorModel = require('prosemirror-model');

var _plugins = require('../plugins');

var _prosemirrorTransform = require('prosemirror-transform');

var _pluginKeys = require('./pluginKeys');

var _schema = require('../schema');

var _require = require('prosemirror-view'),
    DecorationSet = _require.DecorationSet,
    Decoration = _require.Decoration;

var createReferenceDecoration = function createReferenceDecoration(index, node, label) {
	return Decoration.node(index, index + 1, {}, { citationID: node.attrs.citationID, label: label });
};

var findCitationNode = function findCitationNode(doc, citationID) {
	var citationsNode = doc.child(1);
	if (!citationsNode) {
		return null;
	}
	var foundNode = (0, _docOperations.findNodeByFunc)(doc, function (_node) {
		return _node.type.name === 'citation' && _node.attrs.citationID === citationID;
	});
	if (!foundNode) {
		return null;
	}
	var from = foundNode.index;
	var to = from + foundNode.node.nodeSize;
	return { from: from, to: to };
};

var removeDecoration = function removeDecoration(citationID, engine, view) {
	var action = function action() {
		var doc = view.state.doc;
		var foundNodePos = findCitationNode(doc, citationID);
		var countReferences = (0, _docOperations.findNodesByFunc)(doc, function (_node) {
			return _node.type.name === 'reference' && _node.attrs.citationID === citationID;
		});

		if (foundNodePos && countReferences.length === 0) {
			var transaction = view.state.tr.deleteRange(foundNodePos.from, foundNodePos.to);
			transaction.setMeta('deleteReference', citationID);
			view.dispatch(transaction);
		}
	};
	window.setTimeout(action, 0);
	return;
};

var createDecorations = function createDecorations(doc, set, engine) {
	var nodes = (0, _docOperations.findNodesWithIndex)(doc, 'reference') || [];
	var decos = nodes.map(function (node, index) {
		var citationID = node.node.attrs.citationID;
		var label = engine.getShortForm(citationID);
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
	var citationID = citationData.id;
	var newNode = _schema.schema.nodes.citation.create({ data: citationData, citationID: citationID });
	var citationsNode = (0, _docOperations.findNodesWithIndex)(state.doc, 'citations');
	var pos = citationsNode[0].index + 1;

	// tries to find the closest place to insert this note
	var newPoint = (0, _prosemirrorTransform.insertPoint)(state.doc, pos, _schema.schema.nodes.citation, { data: citationData });
	var tr = state.tr.insert(newPoint, newNode);
	tr.setMeta('createdReference', citationID);
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

			/*
   if (transaction.getMeta('docReset')) {
   	const newSet = createAllCitations(state.engine, editorState.doc, state.decos);
   	return {decos: newSet, engine: state.engine};
   }
   */

			var set = state.decos;

			if (transaction.getMeta('createdReference') || transaction.getMeta('deleteReference') || transaction.getMeta('history$')) {
				var blueSet = createDecorations(editorState.doc, state.decos, state.engine);
				return { decos: blueSet, engine: state.engine };
			} else if (transaction.mapping) {
				var newSet = set.map(transaction.mapping, editorState.doc, { onRemove: function onRemove(deco) {
						removeDecoration(deco.citationID, state.engine, _this.spec.editorView);
					} });
				return { decos: newSet, engine: state.engine };
			}

			return { decos: set, engine: state.engine };
		}
	},
	view: function view(editorView) {
		var _this2 = this;

		this.editorView = editorView;
		var pluginState = (0, _plugins.getPluginState)('citations', editorView.state);
		var notFound = pluginState.engine.getMissingCitations(editorView.props.referencesList);
		var _iteratorNormalCompletion = true;
		var _didIteratorError = false;
		var _iteratorError = undefined;

		try {
			for (var _iterator = notFound[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
				var notFoundCitation = _step.value;

				editorView.props.createReference(notFoundCitation);
			}
		} catch (err) {
			_didIteratorError = true;
			_iteratorError = err;
		} finally {
			try {
				if (!_iteratorNormalCompletion && _iterator.return) {
					_iterator.return();
				}
			} finally {
				if (_didIteratorError) {
					throw _iteratorError;
				}
			}
		}

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
		if (citationData = firstTransaction.getMeta('createReference')) {
			var pluginState = this.getState(newState);
			return createReference(citationData, newState, pluginState.engine);
		}
		return null;
	},

	props: {
		getNewCitations: function getNewCitations(state, allReferences) {
			if (state && this.getState(state)) {
				var engine = this.getState(state).engine;
			}
		},
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