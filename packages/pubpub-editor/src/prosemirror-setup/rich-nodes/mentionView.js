import { getPlugin, getPluginState } from '../plugins';

import {MentionComponent} from './components';
import React from 'react';
import ReactDOM from 'react-dom';
import ReactView from './reactview';
import {schema} from '../schema';

class MentionView extends ReactView {
  constructor(node, view, getPos, options) {
    super(node, view, getPos, options);
  }

  bindFunctions() {
    super.bindFunctions();
  }

  renderElement(domChild) {
    const node = this.node;
    const { url, type } = node.attrs;
    const text = this.node.textContent;
    const renderedElem = ReactDOM.render(<MentionComponent key="mention" url={url} text={text} type={type}/>, domChild);
    return renderedElem;
  }

  stopEvent(evt) {
    if (evt.type === "mousedown" || evt.type === "keypress" || evt.type === "input" || evt.type === "keydown" || evt.type === "keyup" || evt.type === "paste") {
      return true;
    }
    return false;
  }

  selectNode() {
    // this.reactElement.setSelected(true);
  }

  deselectNode() {
    // this.reactElement.setSelected(false);
  }

}

export default MentionView;
