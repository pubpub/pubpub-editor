"use strict";

var loopThroughNodes = function loopThroughNodes(doc, nodeFunc) {
  var nodeLoop = function nodeLoop(node, offset, index) {
    nodeFunc(node, offset, index);
    node.forEach(nodeLoop);
  };

  doc.forEach(nodeLoop);
};

var findNodes = function findNodes(doc, nodeType) {
  var foundNodes = [];
  var nodeMatch = function nodeMatch(node, offset, index) {
    if (node.type.name === nodeType) {
      foundNodes.push(node);
    }
  };

  loopThroughNodes(doc, nodeMatch);
  return foundNodes;
};

var findNodeByAttr = function findNodeByAttr(doc, attrKey, attrVal) {
  var foundNode = null;
  var nodeMatch = function nodeMatch(node, offset, index) {
    if (node.attrs.attrKey && node.attrs[attrKey] == attrVal) {
      foundNode = { node: node, index: index };
    }
  };

  loopThroughNodes(doc, nodeMatch);
  return foundNode;
};

var findNodesWithIndex = function findNodesWithIndex(doc, nodeType) {

  var foundNodes = [];
  var nodeSize = doc.nodeSize;

  for (var nodeIndex = 0; nodeIndex < nodeSize - 1; nodeIndex++) {
    var child = doc.nodeAt(nodeIndex);
    if (!child) {
      continue;
    }
    // console.log(child);
    if (child.type.name === nodeType) {
      foundNodes.push({ node: child, index: nodeIndex });
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