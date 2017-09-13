import {DOMParser, DOMSerializer} from 'prosemirror-model';

/*
import { markdownToJSON } from '../markdown/markdownToJson';
import { markdowntoHTML } from '../markdown/markdownToHTML';
*/


const configureClipboard = ({schema}) => {

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
  const transformPastedHTML = function(htmlStr) {
    return htmlStr;
    // const markdown = markdowntoHTML(htmlStr);
    // return markdown;
  }

  const clipboardParser = new DOMParser(schema, defaultRules);

  return { transformPastedHTML, clipboardSerializer, clipboardParser };

}

exports.configureClipboard = configureClipboard;
