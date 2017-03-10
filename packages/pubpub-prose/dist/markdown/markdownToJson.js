'use strict';

var _prosemirrorState = require('prosemirror-state');

var _MarkdownParser = require('./MarkdownParser');

var _setup = require('../setup');

var markdownToJSON = function markdownToJSON(markdown) {
  var contents = _MarkdownParser.markdownParser.parse(markdown);
  var newState = _prosemirrorState.EditorState.create({
    doc: contents
  });
  var doc = newState.doc;
  return doc.toJSON();
};

exports.markdownToJSON = markdownToJSON;