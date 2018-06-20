import React, { Component } from 'react';
import { EditorState, PluginKey, Selection } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { DOMParser } from 'prosemirror-model';
import PropTypes from 'prop-types';
import ReactView from './schema/reactView';
import createSchema from './schema';
import { getBasePlugins } from './schema/setup';

require('./style.scss');

const propTypes = {
	initialContent: PropTypes.object,
	editorId: PropTypes.string,
	onChange: PropTypes.func,
	children: PropTypes.node,
	placeholder: PropTypes.string,
	isReadOnly: PropTypes.bool,
	showHeaderLinks: PropTypes.bool,
	renderStaticMarkup: PropTypes.bool,
	initHtml: PropTypes.string,
};

const defaultProps = {
	initialContent: { type: 'doc', attrs: { meta: {} }, content: [{ type: 'paragraph' }] },
	editorId: undefined,
	onChange: undefined,
	children: undefined,
	placeholder: undefined,
	isReadOnly: false,
	showHeaderLinks: false,
	renderStaticMarkup: false,
	initHtml: undefined,
};


/**
 * @module Components
 */

/**
* @component
*
* The main Editor component, by itself it acts largely as plain textEditor. Nesting plugins enables greater functionality.
*
* @prop {object} initialContent A JSON document representing the initial content. This JSON should be of the form that comes from the 'toJSON' function
* @prop {func} onChange Fired whenever the document is changed.
* @prop {String} placeholder A placeholder string that will appear if there is no content.
* @prop {bool} isReadOnly Set to true to disallow editing, both in text and modifying or inserting add ons.
* @prop {bool} showHeaderLinks Set to true to show links next to headers
* @prop {bool} renderStaticMarkup Set to true to render only static markup on the server.
*
* @example
return <Editor />
*/
class Editor extends Component {
	constructor(props) {
		super(props);
		this.containerId = `pubpub-editor-container-${props.editorId}` || `pubpub-editor-container-${Math.round(Math.random() * 10000)}`;
		this.getJSON = this.getJSON.bind(this);
		this.getPlugin = this.getPlugin.bind(this);

		this.configureSchema = this.configureSchema.bind(this);
		this.configurePlugins = this.configurePlugins.bind(this);
		this.createEditor = this.createEditor.bind(this);
		this.renderStatic = this.renderStatic.bind(this);

		this._isMounted = false;
		this._onAction = this._onAction.bind(this);

		this.schema = this.configureSchema();
		this.pluginsObject = this.configurePlugins(this.schema);
		this.nodeViews = this.configureNodeViews(this.schema);

		const componentChildren = React.Children.map(this.props.children, (child)=> {
			return child ? child.type.pluginName : null;
		}) || [];
		this.state = {
			collabLoading: componentChildren.indexOf('Collaborative') > -1,
		};
		this.importHtml = this.importHtml.bind(this);
	}

	componentDidMount() {
		this._isMounted = true;
		this.createEditor();
		// setTimeout(()=> {
		// 	this.importHtml('<b>WOW!</b>');
		// }, 5000);
	}
	componentWillUnmount() {
		this._isMounted = false;
	}
	/**
	 * Get JSON
	 * @return {json} The JSON structure of the document, useful for saving documents for use in initialContent.
	 */
	getJSON() {
		return this.view.state.doc.toJSON();
	}
	/**
	 * Get Text
	 * @return {string} The plain text content of an editor instance
	 */
	getText() {
		return this.view.state.doc.textContent;
	}
	getCollabJSONs(collabIds) {
		if (this.state.pluginKeys.Collaborative) {
			const collabPlugin = this.state.pluginKeys.Collaborative.get(this.view.state);
			return collabPlugin.getJSONs(collabIds);
		}
		return null;
	}
	getPlugin(key) {
		if (this.state.pluginKeys[key]) {
			return this.state.pluginKeys[key].get(this.state.editorState);
		}
		return null;
	}
	importHtml(htmlString) {
		/* Create wrapper DOM node */
		const wrapperElem = document.createElement('div');

		/* Insert htmlString into wrapperElem to generate full DOM tree */
		wrapperElem.innerHTML = htmlString;

		/* Generate new ProseMirror doc from DOM node */
		const newDoc = DOMParser.fromSchema(this.schema).parse(wrapperElem);

		/* Create transaction and set selection to the beginning of the doc */
		const tr = this.view.state.tr;
		tr.setSelection(Selection.atStart(this.view.state.doc));


		/* Insert each node of newDoc to current doc */
		/* Note, we don't want to just replaceSelectionWith(newDoc) */
		/* because it will add a doc within a doc. */
		newDoc.content.content.forEach((node)=> {
			tr.replaceSelectionWith(node);
		});

		/* Dispatch transaction to setSelection and insert content */
		this.view.dispatch(tr);
	}
	focus() {
		this.view.focus();
	}

	configurePlugins(schema) {
		const pluginKeys = {};

		let plugins = getBasePlugins({
			schema,
			isReadOnly: this.props.isReadOnly,
			placeholder: this.props.placeholder
		});

		if (this.props.children) {
			React.Children.forEach(this.props.children, (child) => {
				if (child && child.type.getPlugins) {
					const key = new PluginKey(child.type.pluginName);
					pluginKeys[child.type.pluginName] = key;
					const addonPlugins = child.type.getPlugins({
						...child.props,
						pluginKey: key,
						getPlugin: this.getPlugin,
					});
					plugins = plugins.concat(addonPlugins);
				}
			});
		}
		return { plugins, pluginKeys };
	}

	configureNodeViews(schema) {
		const nodeViews = {};
		const nodes = schema.nodes;
		Object.keys(nodes).forEach((nodeName) => {
			const nodeSpec = nodes[nodeName].spec;
			if (nodeSpec.toEditable) {
				nodeViews[nodeName] = (node, view, getPos, decorations) => {
					return new ReactView(node, view, getPos, decorations, this.props.isReadOnly);
				};
			}
		});

		return nodeViews;
	}

	configureSchema() {
		const schemaNodes = {};
		const schemaMarks = {};
		if (this.props.children) {
			React.Children.forEach(this.props.children, (child)=> {
				if (child && child.type.schema) {
					const { nodes, marks } = child.type.schema(child.props);
					Object.keys(nodes || {}).forEach((key) => {
						schemaNodes[key] = nodes[key];
					});
					Object.keys(marks || {}).forEach((key) => {
						schemaMarks[key] = marks[key];
					});
				}
			});
		}
		const schema = createSchema(schemaNodes, schemaMarks);
		return schema;
	}

	createEditor() {
		this.state = EditorState.create({
			doc: this.schema.nodeFromJSON(this.props.initialContent),
			schema: this.schema,
			plugins: this.pluginsObject.plugins,
		});

		this.view = new EditorView(this.editorElement, {
			state: this.state,
			dispatchTransaction: this._onAction,
			spellcheck: true,
			editable: () => (!this.props.isReadOnly),
			nodeViews: this.nodeViews,
		});

		this.setState({
			view: this.view,
			editorState: this.state,
			pluginKeys: this.pluginsObject.pluginKeys
		});
	}

	_onAction(transaction) {
		if (this.view && this.view.state && this._isMounted) {
			const newState = this.view.state.apply(transaction);
			this.view.updateState(newState);
			this.setState({ editorState: newState, transaction: transaction }, ()=> {
				if (this.state.collabLoading) {
					this.setState({ collabLoading: false });
				}
			});
			if (this.props.onChange && transaction.docChanged) {
				this.props.onChange(this.view.state.doc.toJSON());
			}
		}
	}

	renderStatic(nodeArray) {
		return nodeArray.map((node, index)=> {
			let children;
			if (node.content) {
				children = this.renderStatic(node.content);
			}
			if (node.type === 'text') {
				const marks = node.marks || [];
				children = marks.reduce((prev, curr)=> {
					const MarkComponent = this.schema.marks[curr.type].spec.toStatic(curr, prev);
					return MarkComponent;
				}, node.text);
			}

			const nodeWithIndex = node;
			nodeWithIndex.currIndex = index;
			const NodeComponent = this.schema.nodes[node.type].spec.toStatic(nodeWithIndex, children, this.props);
			return NodeComponent;
		});
	}

	render() {
		// Click import.
		// Upload file.
		// Convert file into HTML (worker task).
		// When task is done, get HTML.
		// Turn it into a dom node.
		// Feed domNode to collaborative component
		// ---------------
		// if (this.props.initHtml) {
		// 	console.log(this.props.initHtml);
		// 	let tmp = document.createElement("div");
		//     tmp.innerHTML = this.props.initHtml;
		// 	console.log(DOMParser.fromSchema(this.schema).parse(tmp));
		// }

		if (!this._isMounted && this.props.renderStaticMarkup) {
			return this.renderStatic(this.props.initialContent.content);
		}

		const wrapperClasses = `pubpub-editor ${this.props.showHeaderLinks ? 'show-header-links' : ''}`;
		return (
			<div style={{ position: 'relative' }} id={this.containerId} className={this.state.collabLoading ? 'editor-loading' : ''}>
				{this.state.view
					? React.Children.map(this.props.children, (child) => {
						if (!child) { return null; }

						return React.cloneElement(child, {
							view: this.state.view,
							editorState: this.state.editorState,
							transaction: this.state.transaction,
							containerId: this.containerId,
							pluginKey: this.state.pluginKeys[child.type.pluginName],
						});
					})
					: null
				}

				{/* Loading section displayed when collab is loading */}
				<div className="editor-loading-bars">
					<div className="loading pt-skeleton" style={{ width: '95%', height: '1.2em', marginBottom: '1em' }} />
					<div className="loading pt-skeleton" style={{ width: '85%', height: '1.2em', marginBottom: '1em' }} />
					<div className="loading pt-skeleton" style={{ width: '90%', height: '1.2em', marginBottom: '1em' }} />
					<div className="loading pt-skeleton" style={{ width: '80%', height: '1.2em', marginBottom: '1em' }} />
					<div className="loading pt-skeleton" style={{ width: '82%', height: '1.2em', marginBottom: '1em' }} />
				</div>

				{!this._isMounted &&
					<div className={wrapperClasses}>
						<div className="ProseMirror">
							{this.renderStatic(this.props.initialContent.content)}
						</div>
					</div>
				}
				<div ref={(elem)=> { this.editorElement = elem; }} className={wrapperClasses} />
			</div>
		);
	}
}

Editor.propTypes = propTypes;
Editor.defaultProps = defaultProps;
export default Editor;
