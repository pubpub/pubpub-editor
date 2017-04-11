'use strict';

var _prosemirrorModel = require('prosemirror-model');

var _markdownToJson = require('../markdown/markdownToJson');

var _markdownToHTML = require('../markdown/markdownToHTML');

var _schema = require('./schema');

var _toMarkdown = require('to-markdown');

var _toMarkdown2 = _interopRequireDefault(_toMarkdown);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var markSerializer = _prosemirrorModel.DOMSerializer.marksFromSchema(_schema.schema);
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

var getSize = function getSize(dom) {
  var width = dom.getAttribute("width");
  if (width) {
    return width;
  }
  return undefined;
};

// require('split-html');
// Needs to lift out image blocks in their own div
var transformPastedHTML = function transformPastedHTML(htmlStr) {
  var markdown = (0, _markdownToHTML.markdowntoHTML)(htmlStr);
  return markdown;
  return htmlStr;
};

var clipboardParser = new _prosemirrorModel.DOMParser(_schema.schema, defaultRules);

exports.transformPastedHTML = transformPastedHTML;
exports.clipboardSerializer = clipboardSerializer;
exports.clipboardParser = clipboardParser;