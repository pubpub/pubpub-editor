'use strict';

var _prosemirrorState = require('prosemirror-state');

var _markdownSerializer = require('./markdownSerializer');

var _schema = require('../prosemirror-setup/schema');

var jsonToMarkdown = function jsonToMarkdown(docJSON) {
  var newState = _prosemirrorState.EditorState.create({
    doc: _schema.schema.nodeFromJSON(docJSON)
  });
  var doc = newState.doc;
  var markdown = _markdownSerializer.markdownSerializer.serialize(doc);
  return markdown;
};

exports.jsonToMarkdown = jsonToMarkdown;