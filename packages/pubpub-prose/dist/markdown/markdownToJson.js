'use strict';

var _prosemirrorState = require('prosemirror-state');

var _markdownParser = require('./markdownParser');

var _setup = require('../setup');

var markdownToJSON = function markdownToJSON(markdown) {
  var contents = _markdownParser.markdownParser.parse(markdown);
  var newState = _prosemirrorState.EditorState.create({
    doc: contents
  });
  var article = newState.doc;
  var citations = _setup.schema.nodes.citations.create({}, []);
  var doc = _setup.schema.nodes.doc.create({}, [article, citations]);
  return doc.toJSON();
};

exports.markdownToJSON = markdownToJSON;