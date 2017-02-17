import React from 'react';
import ReactDOM from 'react-dom';
import ReactView from './reactview';
import { ReferenceComponent } from './components';
import { getPluginState } from '../plugins';
import { schema } from '../setup';

class ReferenceView extends ReactView {
  constructor(node, view, getPos, options) {
    super(node, view, getPos, options);
    const decorations = options.decorations;
    this.getCitationData();
    this.renderDecorations(decorations);
  }

  renderDecorations(decorations) {
    for (const decoration of decorations) {
      if (decoration.type.options && decoration.type.options.label) {
        this.reactElement.updateLabel(decoration.type.options.label);
      }
    }
  }

  bindFunctions() {
    this.valueChanged = this.valueChanged.bind(this);
    super.bindFunctions();
  }

  renderElement(domChild) {
    const node = this.node;
    return ReactDOM.render(<ReferenceComponent updateValue={this.valueChanged} value={this.value} {...node.attrs}/>, domChild);
  }

  getCitationData() {
    // get Count
    const citations = getPluginState('citations', this.view.state);
  }

  // Register citation info?
  getCountOfCitation() {

  }


	valueChanged() {
    const start = this.getPos();
    const nodeType = schema.nodes.reference;
    const oldNodeAttrs = this.node.attrs;
		const transform = this.view.state.tr.setNodeType(start, nodeType, {citationID: 5});
		const action = transform.action();
		this.view.props.onAction(action);
	}


  update(node, decorations) {
    if (!super.update(node, decorations)) {
      return false
    }
    this.renderDecorations(decorations);
    return true;
  }

  selectNode() {
    this.reactElement.setSelected(true);
  }

  deselectNode() {
    this.reactElement.setSelected(false);
  }

  destroy() {
    // const citations = getPlugin('citations', this.view.state);
    // citations.removeReference(citationID);
  }

}

export default ReferenceView;

// How to click on a view and cite it??
// A plugin that tracks citations and highlights. When you click on a view,
//
// A plugin can be persistent and store state...
// A plugin can add persistence to it
//

// What tracks citation order and terms? What updates citation orders?
// What orders references?
