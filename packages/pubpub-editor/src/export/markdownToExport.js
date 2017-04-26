import { markdownToJSON } from '../markdown';

// Need to parse embeds & mentions
renderNodes = (node, filesMap) => {
  if (node.type === 'embed') {
    if (node.attrs.filename && filesMap[node.attrs.filename]) {
      node.attrs.url = filesMap[node.attrs.filename]
    } else {
      node.attrs.url = "NOTFOUND";
    }
  }

  /*
  if (node.type === 'mention') {
    if (node.attrs.filename && filesMap[node.attrs.filename]) {
      node.attrs.url = filesMap[node.attrs.filename]
    } else {
      node.attrs.url = "NOTFOUND";
    }
  }
  */

  if (node.content && node.content.length > 0) {
    for (const child of node.content) {
      renderNodes(child, filesMap);
    }
  }
}

markdownToExport = ( files, filesMap, referencesList ) => {

  const totalMarkdown = '';

  for (const file of files) {
    totalMarkdown += file;
    totalMarkdown += "\n{{pagebreak}\n";
  }

  const totalJSON = markdownToJSON(totalMarkdown, referencesList);
  renderNodes(totalJSON);
  return totalJSON;

}

export default markdownToExport;
