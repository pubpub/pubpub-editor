import {NodeSelection} from 'prosemirror-state';
import React from 'react';
import ReactDOM from 'react-dom';
import {schema} from '../setup';

function computeChange(oldVal, newVal) {
  let start = 0, oldEnd = oldVal.length, newEnd = newVal.length
  while (start < oldEnd && oldVal.charCodeAt(start) == newVal.charCodeAt(start)) ++start
  while (oldEnd > start && newEnd > start &&
         oldVal.charCodeAt(oldEnd - 1) == newVal.charCodeAt(newEnd - 1)) { oldEnd--; newEnd-- }
  return {from: start, to: oldEnd, text: newVal.slice(start, newEnd)}
}

class ReactView {
  constructor(node, view, getPos, options) {
    this.bindFunctions();
    this.options = options;
    this.block = options.block;
    this.node = node
    this.view = view
    this.getPos = getPos
    this.value = node.textContent;
    const domChild = (this.block) ? document.createElement('div') : document.createElement('span');
		const reactElement = this.renderElement(domChild);
		const dom = domChild.childNodes[0];
    // dom.contentEditable = true;
    this.dom = domChild;
    this.reactElement = reactElement;
  }

  bindFunctions() {
    this.update = this.update.bind(this);
    this.valueChanged = this.valueChanged.bind(this);
  }

  valueChanged(value) {
    if (value != this.value) {
      let change = computeChange(this.value, value)
      this.value = value
      let start = this.getPos() + 1
      let transaction = this.view.state.tr.replaceWith(start + change.from, start + change.to,
                                              change.text ? schema.text(change.text) : null)
      this.view.dispatch(transaction);
    }
  }

  // Needs to be override by child classes
  renderElement(domChild) {
    return null;
  }

  update(node, decorations) {
    if (node.type !== this.node.type) return false
    if (node === this.node && this.decorations === decorations) {
      console.log('Avoided unnecessary evaluation');
      return true;
    }
    this.node = node;
    this.decorations = decorations;
    this.reactElement = this.renderElement(this.dom);
    return true
  }

  changeNode(nodeType, attrs, content) {

    // const nodeText = this.node.textContent;
    const newNode = nodeType.create(attrs, content);

    const start = this.getPos();
    const end = start + this.node.nodeSize;

    const transaction = this.view.state.tr.replaceWith(start, end, newNode);
    this.view.dispatch(transaction);
  }

  /*
  setSelection() {

    const pos = this.getPos();
    const sel = NodeSelection.create(this.view.state.doc, pos);
    const transaction = this.view.state.tr.setSelection(sel);
    this.view.dispatch(transaction);
  }
  */

  /*
  setSelection(anchor, head) {
    console.log('got selection!', anchor, head);
  }
  */

/*
  selectNode() {
    this.cm.focus()
  }
  */

  // Generally avoids 'index out of range' errors
  ignoreMutation(mutation) {
    return true;
  }

  /*

  stopEvent(evt) {
    if (evt.type === 'mousedown') {
      return false;
    }
    return true;
  }
  */
}

export default ReactView;
