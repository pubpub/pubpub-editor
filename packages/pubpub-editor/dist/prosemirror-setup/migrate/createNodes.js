'use strict';

var _cslengine = require('../references/cslengine');

var _cslengine2 = _interopRequireDefault(_cslengine);

var _references = require('../references');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var generateID = function generateID() {
  return Math.floor(Math.random() * 10000000);
};

var createAside = function createAside(note, context) {
  var textAsideNode = { type: 'text', text: note };
  var asideNote = {
    type: 'aside',
    content: [textAsideNode]
  };
  return asideNote;
};

var createReference = function createReference(node, context) {

  var data = node.attrs.data;
  if (data && data.content && data.content.note && !data.content.title) {
    return createAside(data.content.note, context);
  }

  var citationID = data._id;
  var referenceID = generateID();

  var referenceNode = {
    type: 'reference',
    attrs: {
      citationID: citationID,
      referenceID: referenceID
    }
  };

  var citationData = void 0;

  if (!context.debug) {
    var CSLJSON = (0, _references.convertJSONtoCSL)(data.content);
    citationData = CSLJSON && CSLJSON.length > 0 ? CSLJSON[0] : null;
  } else {
    citationData = data.content;
  }

  if (!citationData) {
    return referenceNode;
  }
  citationData.id = citationID;

  var citationNode = {
    type: 'citation',
    attrs: {
      citationID: citationID,
      data: citationData
    }
  };

  context.citations.content.push(citationNode);
  context.citationData.push(citationData);

  return referenceNode;
};

var createEquation = function createEquation(node, context) {
  var data = node.attrs.data;
  var equation = data.content.text ? data.content.text : null;
  var textEquationNode = { type: 'text', text: equation };
  var equationNode = {
    type: 'block_equation',
    content: [textEquationNode]
  };

  return equationNode;
};

var createIframe = function createIframe(node, context) {
  var data = node.attrs.data;
  var url = data.content.source ? data.content.source : null;
  var width = data.content.width ? data.content.width : null;
  var height = data.content.height ? data.content.height : null;

  var iframeNode = {
    type: 'iframe',
    attrs: {
      url: url,
      height: height,
      width: width
    }
  };

  return iframeNode;
};

var createEmbed = function createEmbed(node, context) {
  var data = node.attrs.data;
  var parent = data.parent;
  var filename = data.content ? data.content.title || parent.title : '';
  var url = data.content ? data.content.source || data.content.url : '';

  var embedNode = {
    type: 'embed',
    attrs: {
      size: node.attrs.size,
      align: node.attrs.align,
      filename: filename,
      url: url
    },
    content: []
  };

  // console.log('getting embed', filename, url);

  if (filename) {
    context.fileMap[filename] = url;
  }

  if (node.attrs && node.attrs.caption) {
    var caption = node.attrs.caption;
    var textCaptionNode = { type: 'text', text: caption };
    var captionNode = { type: 'caption', content: [] };
    captionNode.content.push(textCaptionNode);
    embedNode.content.push(captionNode);
  }

  if (context.parent && context.parent.type === 'paragraph') {
    context.pops.push(embedNode);
    return null;
  }

  return embedNode;
};

/*
  type: highlight,
  userId: userId is used to mark who created the highlight
  pubId: pubId is used to mark which pub the highlight is from
  versionId: versionId is used to mark which version the highlight is from
  versionHash: hash of the version the highlight is from
  fileId
  fileHash
  fileName
  prefix: "Can design advance ",
  exact: "science, and ",
  suffix: "can science advance design?",
  context: "Can design advance science, and can science advance design?",
*/

var createHighlight = function createHighlight(node, context) {
  return node;
};

var generateCitations = function generateCitations(context) {
  if (context.debug) {
    return { bib: [], inlineBib: {} };
  }
  var engine = new _cslengine2.default();
  engine.setBibliography(context.citationData);
  var bib = engine.getBibliography();
  var inlineBib = {};
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = context.citationData[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var citation = _step.value;

      var label = engine.getShortForm(citation.id);
      inlineBib[citation.id] = label;
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

  return { bib: bib, inlineBib: inlineBib };
};

exports.createEquation = createEquation;
exports.createReference = createReference;
exports.createEmbed = createEmbed;
exports.createHighlight = createHighlight;
exports.createIframe = createIframe;
exports.generateCitations = generateCitations;