/* eslint-disable class-methods-use-this */
import ReactDOM from 'react-dom';

export default class NodeViewReact {
	/* See https://prosemirror.net/docs/ref/#view.NodeView */
	/* for NodeView specs which this class follows */
	constructor(node, view, getPos, decorations, options) {
		this.view = view;
		this.node = node;
		this.options = options;
		this.isSelected = false;
		this.containerNode = node.type.spec.inline
			? document.createElement('span')
			: document.createElement('div');
		this.renderElement();

		this.dom = this.containerNode;
	}

	/* renderElement is not a requirement of the NodeView spec, but */
	/* a helper function we use to update the React component */
	renderElement() {
		ReactDOM.render(
			this.node.type.spec.toStatic(
				this.node,
				this.options,
				this.isSelected,
				this.view.editable,
				null,
				null,
			),
			this.containerNode,
		);
	}

	update(updateNode) {
		if (updateNode.type !== this.node.type) return false;
		this.node = updateNode;
		this.renderElement();
		return true;
	}

	selectNode() {
		if (this.view.editable) {
			this.isSelected = true;
			this.renderElement();
		}
	}

	deselectNode() {
		if (this.view.editable) {
			this.isSelected = false;
			this.renderElement();
		}
	}

	stopEvent(evt) {
		return (
			evt.type === 'keypress' ||
			evt.type === 'input' ||
			evt.type === 'keydown' ||
			evt.type === 'keyup' ||
			evt.type === 'paste'
		);
	}

	ignoreMutation() {
		return true;
	}
}
