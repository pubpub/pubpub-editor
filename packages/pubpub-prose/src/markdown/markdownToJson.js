import {EditorState} from 'prosemirror-state';
import {markdownParser} from './MarkdownParser';
import {schema as pubSchema} from '../setup';

const markdownToJSON = (markdown) => {
  const newState = EditorState.create({
  	doc: markdownParser.parse(markdown),
  });
  const doc = newState.doc;
  return doc.toJSON();
};

exports.markdownToJSON = markdownToJSON;
