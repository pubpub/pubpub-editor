'use strict';

var _prosemirrorState = require('prosemirror-state');

var _markdownParser = require('./markdownParser');

var _schema = require('../prosemirror-setup/schema');

var markdownToJSON = function markdownToJSON(markdown, citationsList) {
  var contents = _markdownParser.markdownParser.parse(markdown);
  var newState = _prosemirrorState.EditorState.create({
    doc: contents
  });
  var doc = newState.doc.toJSON();

  if (citationsList && citationsList.length > 0) {
    var citations = doc.content[1];
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = citations.content[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var citation = _step.value;

        if (citation.attrs.citationID) {
          (function () {
            var citationID = citation.attrs.citationID;
            var citationData = citationsList.find(function (elem) {
              return elem.id === citationID;
            });
            citation.attrs.data = citationData;
          })();
        }
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }
  }

  return doc;
};

exports.markdownToJSON = markdownToJSON;