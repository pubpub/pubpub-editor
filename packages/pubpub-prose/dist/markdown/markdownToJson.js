'use strict';

var _prosemirrorState = require('prosemirror-state');

var _markdownParser = require('./markdownParser');

var _schema = require('../prosemirror-setup/schema');

var markdownToJSON = function markdownToJSON(markdown) {
  var wrappedMarkdowns = '-----\n  ' + markdown + '\n  -----';
  var contents = _markdownParser.markdownParser.parse(markdown);
  var newState = _prosemirrorState.EditorState.create({
    doc: contents
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