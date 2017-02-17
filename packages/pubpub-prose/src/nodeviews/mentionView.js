import {MentionComponent} from './components';
import React from 'react';
import ReactDOM from 'react-dom';
import ReactView from './reactview';
import {schema} from '../setup';

class MentionView extends ReactView {
  constructor(node, view, getPos, options) {
    super(node, view, getPos, options);
  }

  bindFunctions() {
    super.bindFunctions();
  }

  renderElement(domChild) {
    const node = this.node;
    // updateParams={this.updateNodeParams} {...node.attrs}
    return ReactDOM.render(<MentionComponent updateValue={this.valueChanged} value={this.value} {...node.attrs}/>, domChild);
  }

  selectNode() {
    this.reactElement.setSelected(true);
  }

  deselectNode() {
    this.reactElement.setSelected(false);
  }

}

export default MentionView;
