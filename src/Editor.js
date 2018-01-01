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
		this.state = {};
	}

	componentDidMount() {
		this._isMounted = true;
		this.createEditor();
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

	getPlugin(key) {
		if (this.state.pluginKeys[key]) {
			return this.state.pluginKeys[key].get(this.state.editorState);
		}
		return null;
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
		/* I'm not sure why this was needed. It seems like with */
		/* better render lifecycle management, we wouldn't */
		// if (this.view) {
		// 	this.view.destroy();
		// }

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

	// remove() {
	// 	if (this.view) {
	// 		console.log('Huh - we need destroy')
	// 	}
	// }

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
			const NodeComponent = this.schema.nodes[node.type].spec.toStatic(nodeWithIndex, children);
			return NodeComponent;
		});
	}

	render() {
		// console.log('In Render', this.schema);
		// console.log('this.state.view exists: ', !!this.state.view);
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

				{!this._isMounted &&
					<div className="pubpub-editor">
						<div className="ProseMirror">
							{this.renderStatic(this.props.initialContent.content)}
						</div>
					</div>
				}
				<div ref={(elem)=> { this.editorElement = elem; }} className="pubpub-editor" />
			</div>
		);
	}
}

Editor.propTypes = propTypes;
Editor.defaultProps = defaultProps;
export default Editor;
