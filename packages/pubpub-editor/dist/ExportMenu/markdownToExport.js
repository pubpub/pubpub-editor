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

var markdownToExport = function markdownToExport(files, localFiles, referencesList) {

  var totalMarkdown = '';

  var fileMap = generateFileMap(localFiles);

  var _iteratorNormalCompletion3 = true;
  var _didIteratorError3 = false;
  var _iteratorError3 = undefined;

  try {
    for (var _iterator3 = files[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
      var file = _step3.value;

      totalMarkdown += file;
      totalMarkdown += "\n{{pagebreak}\n";
    }
  } catch (err) {
    _didIteratorError3 = true;
    _iteratorError3 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion3 && _iterator3.return) {
        _iterator3.return();
      }
    } finally {
      if (_didIteratorError3) {
        throw _iteratorError3;
      }
    }
  }

  var totalJSON = (0, _markdown.markdownToJSON)(totalMarkdown, referencesList);
  renderNodes(totalJSON, fileMap);
  return totalJSON;
};

exports.default = markdownToExport;