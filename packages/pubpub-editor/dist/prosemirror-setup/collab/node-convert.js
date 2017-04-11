'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.editorToModel = exports.modelToEditor = undefined;

var _prosemirrorModel = require('prosemirror-model');

var modelToEditor = exports.modelToEditor = function modelToEditor(doc, schema) {
	return _prosemirrorModel.Node.fromJSON(schema, doc.contents);
}; /* To convert to and from how the document is stored in the database to how ProseMirror expects it.
   We use the DOM import for ProseMirror as the JSON we store in the database is really jsonized HTML.
   */

var editorToModel = exports.editorToModel = function editorToModel(pmDoc) {
	// In order to stick with the format used in Fidus Writer 1.1-2.0,
	// we do a few smaller modifications to the node before it is saved.
	return pmDoc.toJSON();
};