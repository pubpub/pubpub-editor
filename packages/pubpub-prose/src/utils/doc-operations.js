

const loopThroughNodes = (doc, nodeFunc) => {
	const nodeLoop = (node, offset, index) => {
		nodeFunc(node, offset, index);
		node.forEach(nodeLoop);
	};

	doc.forEach(nodeLoop);
};

const findNodes = (doc, nodeType) => {
  const foundNodes = [];
	const nodeMatch = (node, offset, index) => {
    if (node.type.name === nodeType) {
      foundNodes.push(node);
    }
	};

	loopThroughNodes(doc, nodeMatch);
  return foundNodes;
};


const findNodeByAttr = (doc, attrKey, attrVal) => {
	let foundNode = null;
	const nodeMatch = (node, offset, index) => {
    if (node.attrs.attrKey && node.attrs[attrKey] == attrVal) {
      foundNode = {node, index};
    }
	};

	loopThroughNodes(doc, nodeMatch);
  return foundNode;
};


const findNodeByFunc = (doc, nodeEval) => {
	let foundNode = null;
	const nodeMatch = (node, index, parent) => {
		if (nodeEval(node)) {
			foundNode = {node, index};
		}
	};

	doc.descendants(nodeMatch);
	// loopThroughNodes(doc, nodeMatch);
  return foundNode;
};



const findNodesWithIndex = (doc, nodeType) => {

  const foundNodes = [];
	const nodeSize = doc.nodeSize;

	for (let nodeIndex = 0; nodeIndex < nodeSize - 1; nodeIndex++) {
    const child = doc.nodeAt(nodeIndex);
    if (!child) {
      continue;
    }
    // console.log(child);
		if (child.type.name === nodeType) {
      foundNodes.push({node: child, index: nodeIndex});
    }
		if (child.isLeaf) {
				nodeIndex += child.nodeSize - 1;
		}

  }

  return foundNodes;
};


exports.loopThroughNodes = loopThroughNodes;
exports.findNodes = findNodes;
exports.findNodesWithIndex = findNodesWithIndex;
exports.findNodeByAttr = findNodeByAttr;
exports.findNodeByFunc = findNodeByFunc;
