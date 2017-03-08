import { getPlugin, getPluginState } from '../plugins';

import React from 'react';
import ReactDOM from 'react-dom';
import ReactView from './reactview';
import { ReferenceComponent } from './components';
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

  getCitationString() {
    const citationID = this.node.attrs.citationID;
    return getPlugin('citations', this.view.state).props.getCitationString(this.view.state, citationID);
  }

  bindFunctions() {
    this.getCitationString = this.getCitationString.bind(this);
    super.bindFunctions();
  }

  renderElement(domChild) {
    const node = this.node;
    return ReactDOM.render(<ReferenceComponent getCitationString={this.getCitationString} {...node.attrs}/>, domChild);
  }

  getCitationData() {
    // get Count
    const citations = getPluginState('citations', this.view.state);
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
