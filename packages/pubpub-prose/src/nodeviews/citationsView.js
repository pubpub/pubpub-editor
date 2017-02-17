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

    super.bindFunctions();
  }

  getBibliography(citationData, citationIDs) {
    return getPlugin('citations', this.view.state).props.getBibliography(this.view.state, citationData, citationIDs);
  }

  renderElement(domChild) {
    const node = this.node;
    const citations = this.getChildren();
    // updateParams={this.updateNodeParams} {...node.attrs}
    return ReactDOM.render(<CitationsComponent getBibliography={this.getBibliography} citations={citations} updateValue={this.valueChanged} value={this.value} {...node.attrs}/>, domChild);
  }

  getChildren() {
    const node = this.node;
    const children = [];
    const childNodes = node.content.content.map((subNode) => {
      return subNode.attrs;
    });
    return childNodes;
  }

  selectNode() {
    this.reactElement.setSelected(true);
  }

  deselectNode() {
    this.reactElement.setSelected(false);
  }

}

export default CitationsView;
