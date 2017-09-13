'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _markdown = require('../markdown');

// Need to parse embeds & mentions
var renderNodes = function renderNodes(node, filesMap) {
  if (node.type === 'embed') {
    if (node.attrs.filename && filesMap[node.attrs.filename]) {
      node.attrs.url = filesMap[node.attrs.filename];
    } else {
      node.attrs.url = "NOTFOUND";
    }
  }

  /*
  if (node.type === 'mention') {
    if (node.attrs.filename && filesMap[node.attrs.filename]) {
      node.attrs.url = filesMap[node.attrs.filename]
    } else {
      node.attrs.url = "NOTFfOUND";
    }
  }
  */

  if (node.content && node.content.length > 0) {
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = node.content[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var child = _step.value;

        renderNodes(child, filesMap);
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
};

var generateFileMap = function generateFileMap(localFiles) {
  var files = localFiles || [];
  var fileMap = {};
  var _iteratorNormalCompletion2 = true;
  var _didIteratorError2 = false;
  var _iteratorError2 = undefined;

  try {
    for (var _iterator2 = files[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
      var file = _step2.value;

      fileMap[file.name] = file.url;
    }
  } catch (err) {
    _didIteratorError2 = true;
    _iteratorError2 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion2 && _iterator2.return) {
        _iterator2.return();
      }
    } finally {
      if (_didIteratorError2) {
        throw _iteratorError2;
      }
    }
  }

  return fileMap;
};

var markdownToExport = function markdownToExport(content, localFiles, referencesList) {

  var fileMap = generateFileMap(localFiles);
  var totalJSON = (0, _markdown.markdownToJSON)(content, referencesList);
  renderNodes(totalJSON, fileMap);
  return totalJSON;
};

exports.default = markdownToExport;