import {IframeComponent} from './components';
import React from 'react';
import ReactDOM from 'react-dom';
import ReactView from './reactview';

class IframeView extends ReactView {
  constructor(node, view, getPos, options) {
    super(node, view, getPos, options);
  }

  bindFunctions() {
    super.bindFunctions();
  }

  renderElement(domChild) {
    return ReactDOM.render(<IframeComponent {...this.node.attrs}/>, domChild);
  }

  selectNode() {
    this.reactElement.setSelected(true);
  }

  deselectNode() {
    this.reactElement.setSelected(false);
  }

}

export default IframeView;
