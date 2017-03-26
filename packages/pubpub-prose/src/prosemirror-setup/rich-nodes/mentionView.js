import { getPlugin, getPluginState } from '../plugins';

import {MentionComponent} from './components';
import React from 'react';
import ReactDOM from 'react-dom';
import ReactView from './reactview';
import {schema} from '../schema';

class MentionView extends ReactView {
  constructor(node, view, getPos, options) {
    super(node, view, getPos, options);
    this.suggestComponent = options.suggestComponent;
    setTimeout(() => this.checkPos(), 0);
  }

  bindFunctions() {
    this.updateMention = this.updateMention.bind(this);
    this.revertToText = this.revertToText.bind(this);
    this.shouldDefaultOpen = this.shouldDefaultOpen.bind(this);
    this.checkPos = this.checkPos.bind(this);

    super.bindFunctions();
  }

  checkPos() {
    const open = this.shouldDefaultOpen();
    if (open) {
      this.reactElement.openEdit();
    }
  }

  shouldDefaultOpen() {
    const sel = this.view.state.selection;
    const from = this.getPos();
    const to = this.getPos() + this.node.nodeSize;
    if (!sel) {
      return false;
    }
    if (sel.$from.pos === from && sel.$to.pos === from ) {
      return true;
    }
    return false;
  }

  renderElement(domChild) {
    const node = this.node;
    const {text, type, meta, editing} = node.attrs;

    const state = this.view.state;
    const relativeFilePlugin = getPlugin('relativefiles', state);
    let allFiles = {};
    if (relativeFilePlugin) {
      allFiles = relativeFilePlugin.props.getAllFiles({state});
    }

    const renderedElem = ReactDOM.render(<MentionComponent key="mention"
    suggestComponent={this.options.suggestComponent}
    updateMention={this.updateMention}
    revertToText={this.revertToText}
    allFiles={allFiles}
    text={text} type={type} meta={meta}/>, domChild);
    this.opened = false;
    return renderedElem;
  }

  updateMention(text) {
    const start = this.getPos();
    const nodeType = schema.nodes.mention;
    const oldNodeAttrs = this.node.attrs;
    const transaction = this.view.state.tr.setNodeType(start, nodeType, {text});
    this.view.dispatch(transaction);
  }

  revertToText() {
    const from = this.getPos();
    const to = from + this.node.nodeSize;
    let transaction = this.view.state.tr.deleteRange(from, to);
    const textnode = schema.text('@');
    transaction = transaction.insert(from, textnode);
    this.view.dispatch(transaction);
  }

  stopEvent(evt) {
    if (evt.type === "mousedown" || evt.type === "keypress" || evt.type === "input" || evt.type === "keydown" || evt.type === "keyup" || evt.type === "paste") {
      return true;
    }
    console.log('did not stop', evt.type);
    return false;
  }

  selectNode() {
    console.log('selecting node!');
    this.reactElement.setSelected(true);
  }

  deselectNode() {
    this.reactElement.setSelected(false);
  }

}

export default MentionView;
