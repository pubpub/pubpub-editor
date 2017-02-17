'use strict';

var _prosemirrorModel = require('prosemirror-model');

var _schema = require('./schema');

var markSerializer = _prosemirrorModel.DOMSerializer.marksFromSchema(_schema.schema);

// import ElementSchema from './elementSchema';

var nodeSerializer = _prosemirrorModel.DOMSerializer.nodesFromSchema(_schema.schema);

/*
nodeSerializer.block_embed = function toDOM(node) {
  return null;
};

nodeSerializer.embed = function toDOM(node) {
  return null;
};
*/

var clipboardSerializer = new _prosemirrorModel.DOMSerializer(nodeSerializer, markSerializer);

var defaultRules = _prosemirrorModel.DOMParser.schemaRules(_schema.schema);
/*

for (const rule of defaultRules) {

  if (rule.node === 'block_embed') {
    rule.tag = 'div.block-embed';
    rule.getAttrs = getNodeAttrs;
  } else if (rule.node === 'embed') {
    rule.tag = 'span.embed';
    rule.getAttrs = getNodeAttrs;
  }
}
*/
var clipboardParser = new _prosemirrorModel.DOMParser(_schema.schema, defaultRules);

exports.clipboardSerializer = clipboardSerializer;
exports.clipboardParser = clipboardParser;