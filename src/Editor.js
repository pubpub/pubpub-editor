import React, { Component } from 'react';
import { EditorState, PluginKey } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import PropTypes from 'prop-types';
import ReactView from './schema/reactView';
import createSchema from './schema';
import { getBasePlugins } from './schema/setup';

require('./style.scss');

const propTypes = {
	initialContent: PropTypes.object,
	onChange: PropTypes.func,
	children: PropTypes.node,
	placeholder: PropTypes.string,
	isReadOnly: PropTypes.bool,
};

const defaultProps = {
	initialContent: { type: 'doc', attrs: { meta: {} }, content: [{ type: 'paragraph' }] },
	onChange: undefined,
	children: undefined,
	placeholder: undefined,
	isReadOnly: false,
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
*
* @example
return <Editor />
*/
class Editor extends Component {
	constructor(props) {
		super(props);
		this.containerId = `pubpub-editor-container-${Math.round(Math.random() * 10000)}`;
		this.state = {};
		this.getJSON = this.getJSON.bind(this);
		this.configureSchema = this.configureSchema.bind(this);
		this.configurePlugins = this.configurePlugins.bind(this);
		this.createEditor = this.createEditor.bind(this);
		this.remove = this.remove.bind(this);
		this._isMounted = false;
		this._onAction = this._onAction.bind(this);
	}

	componentDidMount() {
		this.createEditor();
		this._isMounted = true;
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

	focus() {
		this.view.focus();
	}

	getPlugin = (key) => {
		if (this.state.pluginKeys[key]) {
			return this.state.pluginKeys[key].get(this.state.editorState);
		}
		return null;
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
						getPlugin: this.getPlugin
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
		if (this.view) {
			this.remove();
		}

		const schema = this.configureSchema();
		const place = this.editorElement;

		const contents = this.props.initialContent;
		const { plugins, pluginKeys } = this.configurePlugins(schema);
		const nodeViews = this.configureNodeViews(schema);

		const stateConfig = {
			doc: (contents) ? schema.nodeFromJSON(contents) : schema.nodes.doc.create(),
			schema: schema,
			plugins: plugins,
		};

		const state = EditorState.create(stateConfig);
		const editorView = document.createElement('div');
		place.appendChild(editorView);

		this.view = new EditorView(editorView, {
			state: state,
			dispatchTransaction: this._onAction,
			spellcheck: true,
			editable: () => (!this.props.isReadOnly),
			nodeViews: nodeViews,
		});

		this.setState({ view: this.view, editorState: state, pluginKeys });
	}

	remove() {
		if (this.view) {
			this.view.destroy();
		}
	}

	_onAction(transaction) {
		if (this.view && this.view.state && this._isMounted) {
			const newState = this.view.state.apply(transaction);
			this.view.updateState(newState);
			this.setState({ editorState: newState, transaction: transaction });
			if (this.props.onChange) {
				this.props.onChange(this.view.state.doc.toJSON());
			}
		}
	}

	render() {
		return (
			<div style={{ position: 'relative' }} id={this.containerId}>
				{this.state.view
					? React.Children.map(this.props.children, (child) => {
						if (!child) { return null; }

						return React.cloneElement(child, {
							view: this.state.view,
							editorState: this.state.editorState,
							transaction: this.state.transaction,
							containerId: this.containerId,
							pluginKey: this.state.pluginKeys[child.type.pluginName]
						});
					})
					: null
				}

				<div ref={(elem)=> { this.editorElement = elem; }} className="pubpub-editor" />
			</div>
		);
	}
}

Editor.propTypes = propTypes;
Editor.defaultProps = defaultProps;
export default Editor;
