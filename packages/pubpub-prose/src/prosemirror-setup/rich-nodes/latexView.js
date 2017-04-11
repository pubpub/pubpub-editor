import {LatexComponent} from './components';
import {NodeSelection} from 'prosemirror-state';
import React from 'react';
import ReactDOM from 'react-dom';
import ReactView from './reactview';
import {schema} from '../schema';

class LatexView extends ReactView {
  constructor(node, view, getPos, options) {
    super(node, view, getPos, options);
  }

  bindFunctions() {
    super.bindFunctions();
    this.getContent = this.getContent.bind(this);
    this.valueChanged = this.valueChanged.bind(this);
    this.changeToBlock = this.changeToBlock.bind(this);
    this.changeToInline = this.changeToInline.bind(this);
    this.forceSelection = this.forceSelection.bind(this);
  }

  renderElement(domChild) {
    const val = this.getContent();
    return ReactDOM.render(<LatexComponent
      changeToBlock={this.changeToBlock}
      changeToInline={this.changeToInline}
      block={this.block}
      updateValue={this.valueChanged}
      forceSelection={this.forceSelection}
      value={val}/>, domChild);
  }

  getContent() {
    if (this.node && this.node.attrs && this.node.attrs.content) {
      return this.node.attrs.content;
    } else if (this.node && this.node.firstChild) {
      return this.node.firstChild.text;
    }
    return '';
  }

  valueChanged(content) {
    const start = this.getPos();
    const nodeType = this.node.type;
    const oldNodeAttrs = this.node.attrs;
    const transaction = this.view.state.tr.setNodeType(start, nodeType, {content});
    this.view.dispatch(transaction);
  }

  changeToBlock() {
    this.changeNode(schema.nodes.block_equation, { content: this.getContent() }, null);
  }

  changeToInline() {
    this.changeNode(schema.nodes.equation, {content: this.getContent() }, null);
  }

  selectNode() {
    this.reactElement.setSelected(true);
  }

  deselectNode() {
    this.reactElement.setSelected(false);
  }

  forceSelection() {
    const pos = this.getPos();
    const sel = NodeSelection.create(this.view.state.doc, pos);
    const transaction = this.view.state.tr.setSelection(sel);
    // this.reactElement.focusAndSelect();
    this.view.dispatch(transaction);
  }

  selectNode() {
    this.reactElement.setSelected(true);
  }

  deselectNode() {
    this.reactElement.setSelected(false);
  }

  stopEvent(evt) {
    if (evt.type === "keypress" || evt.type === "input" || evt.type === "keydown" || evt.type === "keyup" || evt.type === "paste" || evt.type === "mousedown") {
      // console.log('Stopped ', evt.type);
      return true;
    }
    console.log('Stop and play ', evt.type);
    return false;
  }

}

export default LatexView;
