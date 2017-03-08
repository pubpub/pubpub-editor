import {EditorState} from 'prosemirror-state';
import {MarkdownParser} from './MarkdownParser';
import {schema as pubSchema} from '../setup';

const markdownToJSON = (markdown) => {
  const newState = EditorState.create({
  	doc: MarkdownParser.parse(markdown),
  });
  const doc = newState.doc;
  return doc.toJSON();
};

exports.markdownToJSON = markdownToJSON;
