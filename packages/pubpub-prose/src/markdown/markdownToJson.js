import {EditorState} from 'prosemirror-state';
import {markdownParser} from './markdownParser';
import {schema} from '../setup';

const markdownToJSON = (markdown) => {
  const contents = markdownParser.parse(markdown);
  const newState = EditorState.create({
  	doc: contents,
  });
  const doc = newState.doc;
  return doc.toJSON();
};

exports.markdownToJSON = markdownToJSON;
