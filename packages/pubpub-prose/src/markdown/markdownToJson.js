import { EditorState } from 'prosemirror-state';
import { markdownParser } from './markdownParser';
import { schema } from '../prosemirror-setup/schema';

const markdownToJSON = (markdown) => {
  const wrappedMarkdowns = `-----
  ${markdown}
  -----`;
  const contents = markdownParser.parse(markdown);
  const newState = EditorState.create({
  	doc: contents,
  });
  console.log('Got state!', JSON.stringify(newState.toJSON()));
  /*
  const article = newState.doc;
  const citations = schema.nodes.citations.create({}, []);
  const doc = schema.nodes.doc.create({}, [article, citations]);
  */
  return newState.doc.toJSON();
};

exports.markdownToJSON = markdownToJSON;
