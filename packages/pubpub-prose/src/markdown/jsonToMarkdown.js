import {EditorState} from 'prosemirror-state';
import {markdownSerializer} from './markdownSerializer';
import {schema} from '../prosemirror-setup/schema';

const jsonToMarkdown = (docJSON) => {
  const newState = EditorState.create({
  	doc: schema.nodeFromJSON(docJSON),
  });
  const doc = newState.doc;
  const markdown = markdownSerializer.serialize(doc);
  return markdown;
};

exports.jsonToMarkdown = jsonToMarkdown;
