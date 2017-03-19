import {CitationsView, EmbedView, IframeView, LatexView, MentionView, ReferenceView} from '../nodeviews';
import {migrateDiffs, migrateMarks, schema as pubSchema} from '../setup';

import { BaseMenu } from '../menus';
import React from 'react';
import ReactDOM from 'react-dom';
import { TextSelection } from 'prosemirror-state';

class BaseEditor {

  constructor() {
    this._onAction = this._onAction.bind(this);
    this.reconfigure = this.reconfigure.bind(this);
  }

  create({place, contents, plugins, config, handlers: { createFile }}) {
    const {buildMenuItems, clipboardParser, clipboardSerializer} = require('../setup');
    const {EditorState} = require('prosemirror-state');
    const {MenuBarEditorView, MenuItem} = require('prosemirror-menu');
    const {EditorView} = require('prosemirror-view');
    const collabEditing = require('prosemirror-collab').collab;

    const menu = buildMenuItems(pubSchema);
    // TO-DO: USE UNIQUE ID FOR USER AND VERSION NUMBER

    this.plugins = plugins;

    const stateConfig = {
    	doc: (contents) ? pubSchema.nodeFromJSON(contents) : undefined,
      schema: pubSchema,
    	plugins: plugins,
      ...config
    };

    console.log('GOT CONFIG', stateConfig);

    const state = EditorState.create(stateConfig);

    const reactMenu = document.createElement('div');
    const editorView = document.createElement('div');
    editorView.className = "pub-body";
    place.appendChild(reactMenu);
    place.appendChild(editorView);

    this.menuElem = reactMenu;

     this.view = new EditorView(editorView, {
      state: state,
      dispatchTransaction: this._onAction,
    	spellcheck: true,
    	clipboardParser: clipboardParser,
    	clipboardSerializer: clipboardSerializer,
      handleDOMEvents: {
        dragstart: (view, evt) => {
          evt.preventDefault();
          return true;
        },
      },
      nodeViews: {
        embed: (node, view, getPos) => new EmbedView(node, view, getPos, {block: true}),
        equation: (node, view, getPos) => new LatexView(node, view, getPos, {block: false}),
        block_equation: (node, view, getPos) => new LatexView(node, view, getPos, {block: true}),
        mention: (node, view, getPos) => new MentionView(node, view, getPos, {block: false}),
        reference: (node, view, getPos, decorations) => new ReferenceView(node, view, getPos, {decorations, block: false}),
        citations: (node, view, getPos) => new CitationsView(node, view, getPos, {block: false}),
        iframe: (node, view, getPos) => new IframeView(node, view, getPos,{}),
      }
    });

    this.menuComponent = ReactDOM.render(<BaseMenu createFile={createFile} menu={menu.fullMenu} view={this.view}/>, reactMenu);
  }

  /*
  _handleClick(view, pos, evt) {
    if (evt.target.nodeName === "P") {
      const selection = this.view.state.tr.selection;
      if (selection.node) {
        const resolvePos = this.view.state.doc.resolve(pos);
        const newSelection = new TextSelection(resolvePos);
        const action = this.view.state.tr.setSelection(newSelection).action();
        this.view.props.onAction(action);
      }
    }
  }
  */

  reconfigure(plugins, config) {
    const state = this.view.state;
    const newState = state.reconfigure({plugins: plugins, ...config});
    this.view.updateState(newState);
  }

  remove() {
    this.menuElem.remove();
    if (this.view) {
      this.view.destroy();
    }
  }



  _onAction (action) {
    /*
    if (action.transform) {
      for (const step of action.transform.steps) {
        // console.log(step);
        if (step.slice.content.content.length === 0) {
          console.log('deleted!');
        const newStep = step.invert(this.view.editor.state.doc);
        action.transform.step(newStep);
        }
      }
    }
    */
    const newState = this.view.state.apply(action);
    this.view.updateState(newState);
    /*
    const {jsonToMarkdown} = require("../markdown");
    console.log(jsonToMarkdown(this.toJSON()));
    */
  }

  _createDecorations = (editorState) => {
    const {DecorationSet} = require("prosemirror-view");
    return DecorationSet.empty;
  }

	changeNode = (currentFrom, nodeType, nodeAttrs) => {
		const state = this.pm;
		const transform = state.tr.setNodeType(currentFrom, nodeType, nodeAttrs);
		const action = transform.action();
		this.applyAction(action);
	}

	getState = () => {
		return this.view.state;
	}

	applyAction = (action) => {
		const newState = this.view.state.apply(action);
		this.view.updateState(newState);
	}

  toJSON = () => {
    return this.view.state.doc.toJSON();
  }

  toMarkdown = () => {
    const {markdownSerializer} = require("../markdown");
    const markdown = markdownSerializer.serialize(this.view.state.doc);
    return markdown;
  }

  setDoc = (newJSONDoc) => {
    const {EditorState} = require('prosemirror-state');
    const newState = EditorState.create({
    	doc: pubSchema.nodeFromJSON(newJSONDoc),
    	plugins: this.plugins,
    });
    this.view.updateState(newState);
    this.view.update(this.view.props);
  }

  renderMenu = () => {
    this.menuComponent.rerender();
  }

  showError = (message) => {
    this.menuComponent.showError(message);
  }


}


exports.BaseEditor = BaseEditor;
