'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.createSchema = undefined;

var _baseSchema = require('./baseSchema');

var _prosemirrorModel = require('prosemirror-model');

var _prosemirrorSchemaList = require('prosemirror-schema-list');

var _prosemirrorSchemaTable = require('prosemirror-schema-table');

var baseSchema = new _prosemirrorModel.Schema({
	nodes: _baseSchema.nodes,
	marks: _baseSchema.marks,
	topNode: 'doc'
});

var schemaNodes = baseSchema.spec.nodes;
var listSchema = (0, _prosemirrorSchemaList.addListNodes)(schemaNodes, 'paragraph block*', 'block');
var tableSchema = (0, _prosemirrorSchemaTable.addTableNodes)(listSchema, 'paragraph block*', 'block');

// export const schema = new Schema({ nodes, marks, topNode: 'doc' });

var createSchema = exports.createSchema = function createSchema() {
	return new _prosemirrorModel.Schema({ nodes: tableSchema, marks: _baseSchema.marks, topNode: 'doc' });
};