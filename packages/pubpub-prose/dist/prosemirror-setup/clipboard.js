'use strict';

var _prosemirrorModel = require('prosemirror-model');

var _schema = require('./schema');

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
  // console.log('Got pasted HTML', htmlStr);
  // const newHTML = window.splitHtml(htmlStr, 'img');
  return htmlStr;
};

/*
for (const rule of defaultRules) {
  if (rule.node === 'embed') {
    rule.tag = "img[src]";
    rule.getAttrs = function(dom) {
      console.log('GETTING ATTRS', this);
      const url = dom.getAttribute("src");
      const file = {
        name: '',
        type: '',
        url,
      };
      const attrs = {
        filename: file.name,
        url: file.url,
        size: getSize(dom),
        align: 'full',
      };
      console.log('attrs', attrs);
      return attrs;
    }
  }
}
*/
var clipboardParser = new _prosemirrorModel.DOMParser(_schema.schema, defaultRules);

exports.transformPastedHTML = transformPastedHTML;
exports.clipboardSerializer = clipboardSerializer;
exports.clipboardParser = clipboardParser;