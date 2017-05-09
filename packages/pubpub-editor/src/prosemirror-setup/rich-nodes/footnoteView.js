import { Fragment, Slice } from 'prosemirror-model';
import { getPlugin, getPluginState } from '../plugins';

import { FootnoteComponent } from './components';
import {NodeSelection} from 'prosemirror-state';
import React from 'react';
import ReactDOM from 'react-dom';
import ReactView from './reactview';
import { findNodesWithIndex } from '../../utils/doc-operations';
import { schema } from '../schema';

class EmbedView extends ReactView {
  constructor(node, view, getPos, options) {
    super(node, view, getPos, options);
  }

  bindFunctions() {
    this.updateCaption = this.updateCaption.bind(this);
    this.createCaption = this.createCaption.bind(this);
    this.removeCaption = this.removeCaption.bind(this);
    this.forceSelection = this.forceSelection.bind(this);

    super.bindFunctions();
  }

  renderElement(domChild) {
    const node = this.node;
    // updateParams={this.updateNodeParams} {...node.attrs}
    const nodeAttrs = node.attrs;

    const footnoteElement =  ReactDOM.render(<FootnoteComponent
      updateAttrs={this.valueChanged}
      setSelection={this.setSelection}
      forceSelection={this.forceSelection}
      {...nodeAttrs}
      />, domChild);

    // this.contentDOM = embedElement.getInsert();
    return footnoteElement;

  }

	valueChanged(nodeAttrs) {
    const start = this.getPos();
    const nodeType = schema.nodes.embed;
    const oldNodeAttrs = this.node.attrs;
		const transaction = this.view.state.tr.setNodeType(start, nodeType,  {...oldNodeAttrs, ...nodeAttrs});
		this.view.dispatch(transaction);
	}


  /*
  setSelection(anchor, head) {
    console.log(anchor, head);NodeSelection
    this.reactElement.setSelected(true);
    // this.reactElement.focusAndSelect();
  }
  */

  /*

  setSelection() {
    console.log('SETTING SELECTION!');
    const pos = this.getPos();
    const sel = NodeSelection.create(this.view.state.doc, pos);
    const transaction = this.view.state.tr.setSelection(sel);
    this.reactElement.setSelected(true);
    this.view.dispatch(transaction);
  }

  */

  forceSelection() {
    const pos = this.getPos();
    const sel = NodeSelection.create(this.view.state.doc, pos);
    const transaction = this.view.state.tr.setSelection(sel);
    // this.reactElement.focusAndSelect();
    this.view.dispatch(transaction);
  }

  stopEvent(evt) {
    if (evt.type === "keypress" || evt.type === "input" || evt.type === "keydown" || evt.type === "keyup" || evt.type === "paste" || evt.type === "mousedown") {
      return true;
    }
    return false;
  }

  selectNode() {
    this.reactElement.focusAndSelect();
  }

  deselectNode() {
    this.reactElement.setSelected(false);
  }

}

export default EmbedView;
