import { findNodeByFunc, findNodes } from '../utils/doc-operations';

import { CitationsComponent } from './components';
import React from 'react';
import ReactDOM from 'react-dom';
import ReactView from './reactview';
import { getPlugin } from '../plugins';
import { schema } from '../setup';

class CitationsView extends ReactView {
  constructor(node, view, getPos, options) {
    super(node, view, getPos, options);
  }

  bindFunctions() {
    this.valueChanged = this.valueChanged.bind(this);
    this.getBibliography = this.getBibliography.bind(this);
    this.deleteItem = this.deleteItem.bind(this);

    super.bindFunctions();
  }

  getBibliography(citationData, citationIDs) {
    return getPlugin('citations', this.view.state).props.getBibliography(this.view.state, citationData, citationIDs);
  }

  renderElement(domChild) {
    const node = this.node;
    const citations = this.getChildren();
    // updateParams={this.updateNodeParams} {...node.attrs}
    return ReactDOM.render(<CitationsComponent
      getBibliography={this.getBibliography}
      citations={citations}
      updateValue={this.valueChanged}
      deleteItem={this.deleteItem}
      value={this.value} {...node.attrs}/>, domChild);
  }

  deleteItem(bibItem) {
    const childPos = this.getChildNode(bibItem);
    if (childPos) {
      const transaction = this.view.state.tr.delete(childPos.from, childPos.to);
      this.view.dispatch(transaction);
    }
  }

  getCitationOrder() {
    const referenceNodes = findNodes(this.view.state.doc, 'reference');
    const sortedIDs = referenceNodes.map((subNode) => {
      return subNode.attrs.citationID;
    });
    return sortedIDs;
  }

  getChildNode(bibItem) {
    let foundNode = findNodeByFunc(this.node, (_node) => (_node.attrs.data.id === bibItem.id));
    if (!foundNode) {
      console.log('could not find textnode', foundNode);
      return null;
    }
    const from = this.getPos() + foundNode.index + 1;
    const to = from + foundNode.node.nodeSize;
    return {from, to};
  }

  getChildren() {
    const node = this.node;
    const children = [];
    const childNodes = node.content.content.map((subNode) => {
      return subNode.attrs;
    });

    // gets the order of citations in the document, and then sorts it by that order
    const citationOrder = this.getCitationOrder();

    const filteredNodes = childNodes.filter(function(node) {
      const nodeIndex = citationOrder.indexOf(node.citationID);
      return (nodeIndex !== -1);
    });

    filteredNodes.sort(function(a, b) {
      const aIndex = citationOrder.indexOf(a.citationID);
      const bIndex = citationOrder.indexOf(b.citationID);
      return aIndex - bIndex;
    });
    return filteredNodes;
  }

  selectNode() {
    this.reactElement.setSelected(true);
  }

  deselectNode() {
    this.reactElement.setSelected(false);
  }

}

export default CitationsView;
