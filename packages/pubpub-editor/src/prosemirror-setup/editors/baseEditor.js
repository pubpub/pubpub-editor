import { CitationsView, EmbedView, FootnoteView, HtmlView, IframeView, LatexView, MentionView, ReferenceView } from '../rich-nodes';

import React from 'react';
import ReactDOM from 'react-dom';
import {getPlugin} from '../plugins';
import { schema as pubSchema } from '../schema';

class BaseEditor {

	constructor() {
		this._onAction = this._onAction.bind(this);
		this.reconfigure = this.reconfigure.bind(this);
	}

	create({ place, contents, plugins, props, config, components: { suggestComponent } = {}, handlers: { createFile, onChange, captureError, updateMentions } }) {
		const { clipboardParser, clipboardSerializer, transformPastedHTML } = require('../clipboard');
		const { markdownParser } = require('../../markdown/markdownParser');

		const { buildMenuItems } = require('../menu-config');
		const { EditorState } = require('prosemirror-state');
		const { EditorView } = require('prosemirror-view');
		// const collabEditing = require('prosemirror-collab').collab;

		const menu = buildMenuItems(pubSchema);
		// TO-DO: USE UNIQUE ID FOR USER AND VERSION NUMBER

		this.plugins = plugins;
		this.handlers = { createFile, onChange, captureError };

		const stateConfig = {
			doc: (contents) ? pubSchema.nodeFromJSON(contents) : undefined,
			schema: pubSchema,
			plugins: plugins,
			...config
		};

		const state = EditorState.create(stateConfig);

		const reactMenu = document.createElement('div');
		const editorView = document.createElement('div');
		editorView.className = 'pub-body';
		// place.appendChild(reactMenu);
		place.appendChild(editorView);

		this.menuElem = reactMenu;

		this.view = new EditorView(editorView, {
			state: state,
			dispatchTransaction: this._onAction,
			spellcheck: true,
			clipboardParser: markdownParser,
			clipboardSerializer: clipboardSerializer,
			// handleContextMenu: (evt, thing, thing2)=> {
			// 	console.log(evt, thing, thing2);
			// },
			transformPastedHTML: transformPastedHTML,
			handleDOMEvents: {
				dragstart: (view, evt) => {
					evt.preventDefault();
					return true;
				},
			},
			viewHandlers: {
				updateMentions: updateMentions,
			},
			nodeViews: {
				embed: (node, view, getPos) => new EmbedView(node, view, getPos, { block: true }),
				equation: (node, view, getPos) => new LatexView(node, view, getPos, { block: false }),
				block_equation: (node, view, getPos) => new LatexView(node, view, getPos, { block: true }),
				mention: (node, view, getPos) => new MentionView(node, view, getPos, { block: false, suggestComponent }),
				reference: (node, view, getPos, decorations) => new ReferenceView(node, view, getPos, { decorations, block: false }),
				citations: (node, view, getPos) => new CitationsView(node, view, getPos, { block: false }),
				iframe: (node, view, getPos) => new IframeView(node, view, getPos, {}),
				html_block: (node, view, getPos) => new HtmlView(node, view, getPos, {}),
				footnote: (node, view, getPos, decorations) => new FootnoteView(node, view, getPos, { decorations, block: false }),
			},
			...props
		});

		return this.view;

	}

	reconfigure(plugins, config) {
		const state = this.view.state;
		const newState = state.reconfigure({ plugins: plugins, ...config });
		this.view.updateState(newState);
	}

	remove() {
		this.menuElem.remove();
		if (this.view) {
			this.view.destroy();
		}
	}

	getMentionPos() {
		let mentionsPlugin;
		if (mentionsPlugin = getPlugin('mentions', this.view.state)) {
			return mentionsPlugin.props.getMentionPos(this.view);
		}
		return null;
	}

	playbackDoc() {
		let trackPlugin;
		if (trackPlugin = getPlugin('track', this.view.state)) {
			trackPlugin.props.resetView.bind(trackPlugin)(this.view);
		}
		return null;
	}

	getTrackedSteps() {
		let trackPlugin;
		if (trackPlugin = getPlugin('track', this.view.state)) {
			const steps =  trackPlugin.props.getTrackedSteps.bind(trackPlugin)(this.view);
			return steps;
		}
		return null;
	}

	rebaseSteps(steps) {
		let rebasePlugin;
		if (rebasePlugin = getPlugin('rebase', this.view.state)) {
			return rebasePlugin.props.rebaseSteps.bind(rebasePlugin)(this.view, steps);
		}
		return null;
	}

	_onAction (transaction) {
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
		if (!this.view || !this.view.state) {
			return;
		}

		const newState = this.view.state.apply(transaction);
		this.view.updateState(newState);
		if (transaction.docChanged) {
			if (this.view.props.onChange) {
				this.view.props.onChange();
			}
		} else if (this.view.props.onCursor) {
			this.view.props.onCursor();
		}

		let firebasePlugin;
		if (firebasePlugin = getPlugin('firebase', this.view.state)) {
			return firebasePlugin.props.updateCollab(transaction, newState);
		}

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
		return this.view.state.doc.toJSON().doc;
	}

	toMarkdown = () => {
		const { markdownSerializer } = require('../../markdown');
		const doc = this.view.state.doc;
		const markdown = markdownSerializer.serialize(this.view.state.doc, {meta: doc.attrs.meta} );
		return markdown;
	}

	setDoc = (newJSONDoc) => {
		const { EditorState } = require('prosemirror-state');
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
