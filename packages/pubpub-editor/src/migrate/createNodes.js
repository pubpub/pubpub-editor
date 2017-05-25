import CitationEngine from '../references/cslengine';
import {convertJSONtoCSL} from '../references';

const generateID = () => {
  return Math.floor(Math.random()* 10000000);
};


const createAside = (note, context) => {
  const textAsideNode = {type: 'text', text: note};
  const asideNote = {
    type: 'aside',
    content: [textAsideNode]
  };
  return asideNote;
}

const createReference = (node, context) => {

  const data = node.attrs.data;
  if (data && data.content && data.content.note && !data.content.title) {
    return createAside(data.content.note, context);
  }

  const citationID = data._id;
  const referenceID = generateID();

  const referenceNode = {
    type: 'reference',
    attrs: {
      citationID,
      referenceID,
    }
  };

  let citationData;

  if (!context.debug) {
    const CSLJSON = convertJSONtoCSL(data.content);
    citationData = (CSLJSON && CSLJSON[0]) ?  CSLJSON[0] : null;
    if (!citationData) {
      console.log('failed citation!');
      // console.log(data.content);
    }
  } else {
    citationData = data.content;
  }

  if (!citationData) {
    return referenceNode;
  }
  citationData.id = citationID;

  const citationNode = {
    type: 'citation',
    attrs: {
      citationID,
      data: citationData,
    }
  };

  context.citations.content.push(citationNode);
  context.citationData.push(citationData);

  return referenceNode;
}


const createEquation = (node, context) => {
  const data = node.attrs.data;
  const equation = (data.content.text) ? data.content.text : null;
  const textEquationNode = {type: 'text', text: equation};
  const equationNode = {
    type: 'block_equation',
    content: [textEquationNode]
  };

  return equationNode;
}


const createIframe = (node, context) => {
  const data = node.attrs.data;
  const url = (data.content.source) ? data.content.source : null;
  const width = (data.content.width) ? data.content.width : null;
  const height = (data.content.height) ? data.content.height : null;

  const iframeNode = {
    type: 'iframe',
    attrs: {
      url,
      height,
      width,
    }
  };

  return iframeNode;
}

const createEmbed = (node, context) => {
  const data = node.attrs.data;
  const parent = data.parent;
  const filename = (data.content) ? (data.content.title || parent.title)  : '';
  const url = (data.content) ? (data.content.source || data.content.url) : '';

  const embedNode = {
    type: 'embed',
    attrs: {
      size: node.attrs.size,
      align: node.attrs.align,
      filename,
      url
    },
    content: [],
  };

  // console.log('getting embed', filename, url);

  if (filename) {
    context.fileMap[filename] = url;
  }

  if (node.attrs && node.attrs.caption) {
    const caption = node.attrs.caption;
    const textCaptionNode = {type: 'text', text: caption};
    const captionNode = {type: 'caption', content: []};
    captionNode.content.push(textCaptionNode);
    embedNode.content.push(captionNode);
  }

  if (context.parent && context.parent.type === 'paragraph') {
    context.pops.push(embedNode);
    return null;
  }

  return embedNode;
}

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

const createHighlight = (node, context) => {
  return node;
}

const generateCitations = (context) => {
  if (context.debug) {
    return {bib: [], inlineBib: {}};
  }
  const engine = new CitationEngine();
  engine.setBibliography(context.citationData);
  const bib = engine.getBibliography();
  const inlineBib = {};
  for (const citation of context.citationData) {
    const label = engine.getShortForm(citation.id);
    inlineBib[citation.id] = label;
  }
  return {bib, inlineBib};
}

exports.createEquation = createEquation;
exports.createReference = createReference;
exports.createEmbed = createEmbed;
exports.createHighlight = createHighlight;
exports.createIframe = createIframe;
exports.generateCitations = generateCitations;
