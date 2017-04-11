import { EditorState } from 'prosemirror-state';
import { markdownParser } from './markdownParser';
import { schema } from '../prosemirror-setup/schema';

const markdownToJSON = (markdown, citationsList) => {
  const contents = markdownParser.parse(markdown);
  const newState = EditorState.create({
  	doc: contents,
  });
  const doc = newState.doc.toJSON();

  if (citationsList && citationsList.length > 0) {
    const citations = doc.content[1];
    if (citations && citations.content && citations.content.length > 0) {
      for (const citation of citations.content) {
        if (citation.attrs.citationID) {
          const citationID = citation.attrs.citationID;
          const citationData = citationsList.find(function(elem) {
            return (elem.id === citationID);
          });
          citation.attrs.data = citationData;
        }
      }
    }
  }

  return doc;
};

exports.markdownToJSON = markdownToJSON;
