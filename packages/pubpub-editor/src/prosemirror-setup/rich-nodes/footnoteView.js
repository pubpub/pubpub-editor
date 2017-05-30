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
    this.forceSelection = this.forceSelection.bind(this);
    this.updateContent = this.updateContent.bind(this);

    super.bindFunctions();
  }

  renderElement(domChild) {
    const node = this.node;
    // updateParams={this.updateNodeParams} {...node.attrs}
    const nodeAttrs = node.attrs;

    const footnoteElement =  ReactDOM.render(<FootnoteComponent
      updateContent={this.updateContent}
      setSelection={this.setSelection}
      forceSelection={this.forceSelection}
      {...nodeAttrs}
      />, domChild);

    // this.contentDOM = embedElement.getInsert();
    return footnoteElement;

  }

	updateContent(content) {
    super.updateAttrs({content});
	}

  stopEvent(evt) {
    if (evt.type === "keypress" || evt.type === "input" || evt.type === "keydown" || evt.type === "keyup" || evt.type === "paste" || evt.type === "mousedown") {
      return true;
    }
    return false;
  }

  selectNode() {
    this.reactElement.setSelected(true);
    // this.reactElement.focusAndSelect();
  }

  deselectNode() {
    this.reactElement.setSelected(false);
  }

}

export default EmbedView;
