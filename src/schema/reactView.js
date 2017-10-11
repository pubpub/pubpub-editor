/* eslint-disable react/no-render-return-value */
/* eslint-disable class-methods-use-this */
import { NodeSelection } from 'prosemirror-state';
import React from 'react';
import ReactDOM from 'react-dom';
import ReactViewWrapper from './ReactViewWrapper';

class ReactView {
	constructor(node, view, getPos, decorations, isReadOnly) {
		this.changeNode = this.changeNode.bind(this);
		this.updateAttrs = this.updateAttrs.bind(this);
		this.updateContent = this.updateContent.bind(this);
		this.renderElement = this.renderElement.bind(this);
		this.forceSelection = this.forceSelection.bind(this);
		this.stopEvent = this.stopEvent.bind(this);
		this.ignoreMutation = this.ignoreMutation.bind(this);

		const nodeSpec = node.type.spec;
		this.decorations = decorations;
		this.block = (!nodeSpec.inline);
		this.node = node;
		this.view = view;
		this.getPos = getPos;
		this.renderComponent = (!isReadOnly) ? nodeSpec.toEditable : nodeSpec.toStatic;

		const domChild = this.block ? document.createElement('div') : document.createElement('span');
		this.renderElement(domChild);
		this.dom = domChild;
	}

	updateAttrs(nodeAttrs) {
		const start = this.getPos();
		const oldNodeAttrs = this.node.attrs;
		const transaction = this.view.state.tr.setNodeMarkup(
			start,
			null,
			{ ...oldNodeAttrs, ...nodeAttrs }
		);
		this.view.dispatch(transaction);
	}

	updateContent(content) {
		const start = this.getPos();
		const nodeType = this.node.type;
		const transaction = this.view.state.tr.setNodeMarkup(start, nodeType, { content });
		this.view.dispatch(transaction);
	}

	// Needs to be override by child classes
	renderElement(domChild) {
		ReactDOM.render(
			<ReactViewWrapper
				ref={(elem)=> { this.reactElement = elem; }}
				node={this.node}
				view={this.view}
				decorations={this.decorations}
				forceSelection={this.forceSelection}
				updateAttrs={this.updateAttrs}
				updateContent={this.updateContent}
				changeNode={this.changeNode}
				renderComponent={this.renderComponent}
				getPos={this.getPos}
				isReadOnly={this.isReadOnly}
			/>,
			domChild
		);
	}

	update(node, decorations) {
		if (node.type !== this.node.type) return false;
		if (node === this.node && this.decorations === decorations) {
			return true;
		}
		this.node = node;
		this.decorations = decorations;
		this.renderElement(this.dom);
		return true;
	}

	changeNode(nodeType, attrs, content) {
		// const nodeText = this.node.textContent;
		const newNode = nodeType.create(attrs, content);

		const start = this.getPos();
		const end = start + this.node.nodeSize;

		const transaction = this.view.state.tr.replaceWith(start, end, newNode);
		this.view.dispatch(transaction);
	}

	forceSelection() {
		const pos = this.getPos();
		const sel = NodeSelection.create(this.view.state.doc, pos);
		const transaction = this.view.state.tr.setSelection(sel);
		// this.reactElement.focusAndSelect();
		this.view.dispatch(transaction);
	}

	selectNode() {
		this.reactElement.focusAndSelect();
	}

	deselectNode() {
		this.reactElement.setSelected(false);
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
	// ignoreMutation(mutation) {
	ignoreMutation() {
		return true;
	}

	stopEvent(evt) {
		if (evt.type === 'keypress' || evt.type === 'input' || evt.type === 'keydown' || evt.type === 'keyup' || evt.type === 'paste' || evt.type === 'mousedown') {
			return true;
		}
		return false;
	}
}

export default ReactView;
