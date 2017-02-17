import {DOMParser, DOMSerializer} from 'prosemirror-model';

// import ElementSchema from './elementSchema';
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
const clipboardParser = new DOMParser(schema, defaultRules);


exports.clipboardSerializer = clipboardSerializer;
exports.clipboardParser = clipboardParser;
