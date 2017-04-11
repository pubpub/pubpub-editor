import {DOMParser, DOMSerializer} from 'prosemirror-model';

import { markdownToJSON } from '../markdown/markdownToJson';
import { markdowntoHTML } from '../markdown/markdownToHTML';
import {schema} from './schema';
import toMarkdown from 'to-markdown';

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
  const markdown = markdowntoHTML(htmlStr);
  return markdown;
  return htmlStr;
}

const clipboardParser = new DOMParser(schema, defaultRules);

exports.transformPastedHTML = transformPastedHTML;
exports.clipboardSerializer = clipboardSerializer;
exports.clipboardParser = clipboardParser;
