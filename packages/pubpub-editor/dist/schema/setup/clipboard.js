'use strict';

var _prosemirrorModel = require('prosemirror-model');

/*
import { markdownToJSON } from '../markdown/markdownToJson';
import { markdowntoHTML } from '../markdown/markdownToHTML';
*/

var configureClipboard = function configureClipboard(_ref) {
  var schema = _ref.schema;


  var markSerializer = _prosemirrorModel.DOMSerializer.marksFromSchema(schema);
  var nodeSerializer = _prosemirrorModel.DOMSerializer.nodesFromSchema(schema);

  /*
  nodeSerializer.block_embed = function toDOM(node) {
    return null;
  };
   nodeSerializer.embed = function toDOM(node) {
    return null;
  };
  */

  var clipboardSerializer = new _prosemirrorModel.DOMSerializer(nodeSerializer, markSerializer);
  var defaultRules = _prosemirrorModel.DOMParser.schemaRules(schema);
  var transformPastedHTML = function transformPastedHTML(htmlStr) {
    return htmlStr;
    // const markdown = markdowntoHTML(htmlStr);
    // return markdown;
  };

  var clipboardParser = new _prosemirrorModel.DOMParser(schema, defaultRules);

  return { transformPastedHTML: transformPastedHTML, clipboardSerializer: clipboardSerializer, clipboardParser: clipboardParser };
};

exports.configureClipboard = configureClipboard;