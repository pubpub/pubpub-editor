import {createEmbed, createEquation, createHighlight, createIframe, createReference, generateCitations} from './createNodes';

const NodeCreation = {
  image: createEmbed,
  embed: createEmbed,
  video: createEmbed,
  latex: createEquation,
  reference: createReference,
  highlight: createHighlight,
  iframe: createIframe,
};

const assert = () => {

};

const flatten = list => list.reduce(
    (a, b) => a.concat(Array.isArray(b) ? flatten(b) : b), []
);



const migrateNode = (node, context) => {
  if (node.type === 'embed') {
    const hasData = (!!node.attrs.data);
    if (!hasData) {
      return null;
    }

    const nodeType = node.attrs.data.type;
    assert(!!nodeType);
    const nodeCreate = NodeCreation[nodeType];
    if (nodeCreate) {
      return nodeCreate(node, context);
    }
    console.log('Got type not found', nodeType);
    return null;

  } else if (node.content && node.content.length > 0) {
    const oldContext = Object.assign({}, context);
    context.parent = node;
    context.pops = [];
    node.content = migrateContents(node.content, context);
    const pops = context.pops;
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

const migrateContents = (nodes, context) => {
  if (!nodes) {
    return [];
  }
  return flatten(nodes.map((node) => {
    return migrateNode(node, context);
  }).filter((node) => !!node));
};

exports.migrateJSON = (doc, debug = false) => {

  assert((doc.type === 'document'));
  const article = {type: 'article', content: null};
  const citations = {type: 'citations', content: []};

  const context = {
    citations: citations,
    citationData: [],
    fileMap: { },
    debug
  };
  article.content = migrateContents(doc.content, context);

  const { bib, inlineBib } = generateCitations(context);

  const newDoc = {
    type: 'doc',
    content: [article, citations],
    attrs: {
      meta: {
        bib, inlineBib
      }
    }
  };

  return { docJSON: newDoc, fileMap: context.fileMap };
};
