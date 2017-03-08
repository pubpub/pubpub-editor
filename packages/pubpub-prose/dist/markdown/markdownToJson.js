'use strict';

var _prosemirrorState = require('prosemirror-state');

var _MarkdownParser = require('./MarkdownParser');

var _setup = require('../setup');

var markdownToJSON = function markdownToJSON(markdown) {
  var newState = _prosemirrorState.EditorState.create({
    doc: _MarkdownParser.MarkdownParser.parse(markdown)
  });
  var doc = newState.doc;
  return doc.toJSON();
};

exports.markdownToJSON = markdownToJSON;