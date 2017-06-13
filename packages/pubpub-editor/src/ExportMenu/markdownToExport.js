import { markdownToJSON } from '../markdown';

// Need to parse embeds & mentions
const renderNodes = (node, filesMap) => {
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
      node.attrs.url = "NOTFfOUND";
    }
  }
  */

  if (node.content && node.content.length > 0) {
    for (const child of node.content) {
      renderNodes(child, filesMap);
    }
  }
}

const generateFileMap = (localFiles) => {
	const files = localFiles || [];
	const fileMap = {};
	for (const file of files) {
		fileMap[file.name] = file.url;
	}
	return fileMap;
}

const markdownToExport = ( content, localFiles, referencesList ) => {

	const fileMap = generateFileMap(localFiles);
  const totalJSON = markdownToJSON(content, referencesList);
  renderNodes(totalJSON, fileMap);
  return totalJSON;

}

export default markdownToExport;
