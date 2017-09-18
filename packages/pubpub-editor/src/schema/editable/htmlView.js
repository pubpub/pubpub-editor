import { HtmlComponent } from './components';
import { NodeSelection } from 'prosemirror-state';
import React from 'react';
import ReactDOM from 'react-dom';
import ReactView from './reactview';

class HtmlView extends ReactView {
  constructor(node, view, getPos, options) {
    super(node, view, getPos, options);
  }

  bindFunctions() {
    super.bindFunctions();
    this.valueChanged = this.valueChanged.bind(this);
    this.forceSelection = this.forceSelection.bind(this);
  }

  renderElement(domChild) {
    const content = (this.node.attrs) ? this.node.attrs.content : null;
    return ReactDOM.render(<HtmlComponent
      forceSelection={this.forceSelection}
      content={content}/>, domChild);
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
      return true;
    }
    return false;
  }

}

export default HtmlView;
