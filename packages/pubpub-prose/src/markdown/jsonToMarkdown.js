import {EditorState} from 'prosemirror-state';
import {markdownSerializer} from './markdownSerializer';
import {schema as pubSchema} from '../setup';

const jsonToMarkdown = (docJSON) => {
  const newState = EditorState.create({
  	doc: pubSchema.nodeFromJSON(docJSON),
  });
  const doc = newState.doc;
  const markdown = markdownSerializer.serialize(doc);
  return markdown;
};

exports.jsonToMarkdown = jsonToMarkdown;
