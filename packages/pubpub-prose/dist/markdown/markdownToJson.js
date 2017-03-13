'use strict';

var _prosemirrorState = require('prosemirror-state');

var _markdownParser = require('./markdownParser');

var _setup = require('../setup');

var markdownToJSON = function markdownToJSON(markdown) {
  var contents = _markdownParser.markdownParser.parse(markdown);
  var newState = _prosemirrorState.EditorState.create({
    doc: contents
  });
  var doc = newState.doc;
  return doc.toJSON();
};

exports.markdownToJSON = markdownToJSON;