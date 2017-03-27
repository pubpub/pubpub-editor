'use strict';

var _prosemirrorState = require('prosemirror-state');

var _markdownParser = require('./markdownParser');

var _schema = require('../prosemirror-setup/schema');

var markdownToJSON = function markdownToJSON(markdown) {
  var contents = _markdownParser.markdownParser.parse(markdown);
  var newState = _prosemirrorState.EditorState.create({
    doc: contents
  });
  var article = newState.doc;
  var citations = _schema.schema.nodes.citations.create({}, []);
  var doc = _schema.schema.nodes.doc.create({}, [article, citations]);
  return doc.toJSON();
};

exports.markdownToJSON = markdownToJSON;