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

const markdownToExport = ( files, localFiles, referencesList ) => {

  let totalMarkdown = '';

	const fileMap = generateFileMap(localFiles);

  for (const file of files) {
    totalMarkdown += file;
    totalMarkdown += "\n{{pagebreak}\n";
  }

  const totalJSON = markdownToJSON(totalMarkdown, referencesList);
  renderNodes(totalJSON, fileMap);
  return totalJSON;

}

export default markdownToExport;
