import {Fragment, Slice} from 'prosemirror-model';
import { getPlugin, getPluginState } from '../plugins';

import {EmbedComponent} from './components';
import {NodeSelection} from 'prosemirror-state';
import React from 'react';
import ReactDOM from 'react-dom';
import ReactView from './reactview';
import { findNodesWithIndex } from '../utils/doc-operations';
import {schema} from '../setup';

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

    if (nodeAttrs.filename) {
      const state = this.view.state;
      const relativeFilePlugin = getPlugin('relativefiles', state);
      if (relativeFilePlugin) {
        const fileURL = relativeFilePlugin.props.getFile({filename: nodeAttrs.filename, state});
        nodeAttrs.url = fileURL;
      }
    }

    const contentNode = node.content;
    const hasCaption = (contentNode && contentNode.content && contentNode.content.length > 0);
    const caption = (hasCaption) ? contentNode.content[0].content.content[0].text : null;

    const embedElement =  ReactDOM.render(<EmbedComponent
      updateAttrs={this.valueChanged}
      setSelection={this.setSelection}
      updateCaption={this.updateCaption}
      createCaption={this.createCaption}
      removeCaption={this.removeCaption}
      forceSelection={this.forceSelection}
      {...nodeAttrs}
      caption={caption}
      />, domChild);

    // this.contentDOM = embedElement.getInsert();
    return embedElement;

  }

	valueChanged(nodeAttrs) {
    const start = this.getPos();
    const nodeType = schema.nodes.embed;
    const oldNodeAttrs = this.node.attrs;
		const transaction = this.view.state.tr.setNodeType(start, nodeType,  {...oldNodeAttrs, ...nodeAttrs});
		this.view.dispatch(transaction);
	}

  createCaption() {
    // Need to check if caption already exists?
    const from = this.getPos() + 1;
    const textnode = schema.text('Enter caption');
    const captionNode = schema.nodes.caption.create({}, textnode);
    const transaction = this.view.state.tr.insert(from, captionNode);
    this.view.dispatch(transaction);
  }

  removeCaption() {
    let textNode = this.getTextNode();
    if (!textNode) {
      console.log('could not find textNode');
      return;
    }
    const from = textNode.from - 1;
    const to = textNode.to;
    const checkSlice = this.view.state.doc.slice(from, to);
    const transaction = this.view.state.tr.deleteRange(from, to);
    this.view.dispatch(transaction);
  }

  getTextNode() {
    let textNode = findNodesWithIndex(this.node, 'text');
    if (textNode.length === 1) {
      textNode = textNode[0];
    } else {
      console.log('could not find textnode', this.node);
      return null;
    }
    const from = this.getPos() + textNode.index + 1;
    const to = from + textNode.node.nodeSize;
    return {from, to};
  }

  updateCaption(txt) {
    // assumes no marks or anything
    let textNode = this.getTextNode();

    if (!textNode) {
      console.log('could not find textNode');
      return;
    }

    const slice = new Slice(Fragment.from(schema.text(txt)), 0, 0);
    const transaction = this.view.state.tr.replaceRange(textNode.from, textNode.to, slice);
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
    if (evt.type === "keypress" || evt.type === "input" || evt.type === "keydown" || evt.type === "keyup") {
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
