'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _docOperations = require('../../utils/doc-operations');

var _prosemirrorState = require('prosemirror-state');

var _prosemirrorModel = require('prosemirror-model');

var _plugins = require('../plugins');

var _prosemirrorTransform = require('prosemirror-transform');

var _pluginKeys = require('./pluginKeys');

var _schema = require('../schema');

var _require = require('prosemirror-view'),
    DecorationSet = _require.DecorationSet,
    Decoration = _require.Decoration;

var createFootnoteDecoration = function createFootnoteDecoration(index, node, label) {
	return Decoration.node(index, index + node.nodeSize, {}, { label: label });
};

var createDecorations = function createDecorations(doc, set) {
	var nodes = (0, _docOperations.findNodesWithIndex)(doc, 'footnote') || [];
	var count = 0;
	var decos = nodes.map(function (node, index) {
		count++;
		var deco = createFootnoteDecoration(node.index, node.node, count);
		return deco;
	});

	var newSet = DecorationSet.create(doc, decos);
	return newSet;
};

var footnotesPlugin = new _prosemirrorState.Plugin({
	state: {
		init: function init(config, instance) {
			var set = createDecorations(instance.doc, DecorationSet.empty);
			return {
				decos: set
			};
		},
		apply: function apply(transaction, state, prevEditorState, editorState) {

			/*
   if (transaction.getMeta('docReset')) {
   	const newSet = createAllCitations(state.engine, editorState.doc, state.decos);
   	return {decos: newSet, engine: state.engine};
   }
   */
			var set = state.decos;

			if (transaction.mapping || transaction.getMeta('history$')) {
				var blueSet = createDecorations(editorState.doc, state.decos);
				return { decos: blueSet };
			}

			return { decos: set };
		}
	},

	props: {
		decorations: function decorations(state) {
			if (state && this.getState(state) && this.getState(state).decos) {
				return this.getState(state).decos;
			}
			return null;
		}
	}
});

exports.default = footnotesPlugin;