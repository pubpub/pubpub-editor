import {DOMParser, DOMSerializer} from 'prosemirror-model';

import {schema} from './schema';

const markSerializer = DOMSerializer.marksFromSchema(schema);
const nodeSerializer = DOMSerializer.nodesFromSchema(schema);

/*
nodeSerializer.block_embed = function toDOM(node) {
  return null;
};

nodeSerializer.embed = function toDOM(node) {
  return null;
};
*/

const clipboardSerializer = new DOMSerializer(nodeSerializer, markSerializer);

const defaultRules = DOMParser.schemaRules(schema);

const getSize = function(dom) {
  const width = dom.getAttribute("width");
  if (width) {
    return width;
  }
  return undefined;
}


// require('split-html');
// Needs to lift out image blocks in their own div
const transformPastedHTML = function(htmlStr) {
  // console.log('Got pasted HTML', htmlStr);
  // const newHTML = window.splitHtml(htmlStr, 'img');
  return htmlStr;
}

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
const clipboardParser = new DOMParser(schema, defaultRules);

exports.transformPastedHTML = transformPastedHTML;
exports.clipboardSerializer = clipboardSerializer;
exports.clipboardParser = clipboardParser;
