'use strict';

var _createNodes = require('./createNodes');

var NodeCreation = {
  image: _createNodes.createEmbed,
  embed: _createNodes.createEmbed,
  video: _createNodes.createEmbed,
  latex: _createNodes.createEquation,
  reference: _createNodes.createReference,
  highlight: _createNodes.createHighlight,
  iframe: _createNodes.createIframe
};

var assert = function assert() {};

var flatten = function flatten(list) {
  return list.reduce(function (a, b) {
    return a.concat(Array.isArray(b) ? flatten(b) : b);
  }, []);
};

var migrateNode = function migrateNode(node, context) {
  if (node.type === 'embed') {
    var hasData = !!node.attrs.data;
    if (!hasData) {
      return null;
    }

    var nodeType = node.attrs.data.type;
    assert(!!nodeType);
    var nodeCreate = NodeCreation[nodeType];
    if (nodeCreate) {
      return nodeCreate(node, context);
    }
    console.log('Got type not found', nodeType);
    return null;
  } else if (node.content && node.content.length > 0) {
    var oldContext = Object.assign({}, context);
    context.parent = node;
    context.pops = [];
    node.content = migrateContents(node.content, context);
    var pops = context.pops;
    context = oldContext;
    if (pops.length === 0) {
      return node;
    } else {
      return [node].concat(pops);
    }
  } else {
    return node;
  }
};

var migrateContents = function migrateContents(nodes, context) {
  if (!nodes) {
    return [];
  }
  return flatten(nodes.map(function (node) {
    return migrateNode(node, context);
  }).filter(function (node) {
    return !!node;
  }));
};

exports.migrateJSON = function (doc) {
  var debug = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;


  assert(doc.type === 'document');
  var article = { type: 'article', content: null };
  var citations = { type: 'citations', content: [] };

  var context = {
    citations: citations,
    citationData: [],
    fileMap: {},
    debug: debug
  };
  article.content = migrateContents(doc.content, context);

  var _generateCitations = (0, _createNodes.generateCitations)(context),
      bib = _generateCitations.bib,
      inlineBib = _generateCitations.inlineBib;

  var newDoc = {
    type: 'doc',
    content: [article, citations],
    attrs: {
      meta: {
        bib: bib, inlineBib: inlineBib
      }
    }
  };

  return { docJSON: newDoc, fileMap: context.fileMap };
};