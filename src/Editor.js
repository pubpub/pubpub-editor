import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { Schema } from 'prosemirror-model';
import { keydownHandler } from 'prosemirror-keymap';
import { nodes, marks } from './schemas';
import { requiredPlugins, optionalPlugins } from './plugins';
import NodeViewReact from './nodeViewReact';
import { renderStatic } from './utilities';

// TODO - next steps
// Show collaborative loading bars somehow.

require('./style.scss');

const propTypes = {
	customNodes: PropTypes.object, 		/* Object of custom nodes. To remove default node, override. For example, { image: null, header: null } */
	customMarks: PropTypes.object,
	customPlugins: PropTypes.object, 	/* All customPlugins values should be a function, which is passed schema and props - and returns a Plugin */
	nodeOptions: PropTypes.object, 		/* An object with nodeName keys and values of objects of overriding options. For example: nodeOptions = { image: { linkToSrc: false } } */
	collaborativeOptions: PropTypes.object,
	onChange: PropTypes.func,
	initialContent: PropTypes.object,
	placeholder: PropTypes.string,
	isReadOnly: PropTypes.bool,
	highlights: PropTypes.array,
	getHighlightContent: PropTypes.func,
};

const defaultProps = {
	customNodes: {}, 	/* defaults: 'blockquote', 'horizontal_rule', 'heading', 'ordered_list', 'bullet_list', 'list_item', 'code_block', 'text', 'hard_break', 'image' */
	customMarks: {}, 	/* defaults: 'em', 'strong', 'link', 'sub', 'sup', 'strike', 'code' */
	customPlugins: {}, 	/* defaults: inputRules, keymap, headerIds, placeholder */
	nodeOptions: {},
	collaborativeOptions: {},
	onChange: ()=>{},
	initialContent: { type: 'doc', attrs: { meta: {} }, content: [{ type: 'paragraph' }] },
	placeholder: '',
	isReadOnly: false,
	highlights: [],
	getHighlightContent: ()=>{},
};

class Editor extends Component {
	constructor(props) {
		super(props);

		this.configureSchema = this.configureSchema.bind(this);
		this.configurePlugins = this.configurePlugins.bind(this);
		this.configureNodeViews = this.configureNodeViews.bind(this);

		this.createEditor = this.createEditor.bind(this);

		this.editorRef = React.createRef();
		this.schema = this.configureSchema();
		this.plugins = undefined;
		this.nodeViews = undefined;
	}

	componentDidMount() {
		this.plugins = this.configurePlugins();
		this.nodeViews = this.configureNodeViews();
		this.createEditor();
	}

	configureSchema() {
		const schemaNodes = {
			...nodes,
			...this.props.customNodes
		};
		const schemaMarks = {
			...marks,
			...this.props.customMarks
		};

		/* Filter out undefined (e.g. overwritten) nodes and marks */
		Object.keys(schemaNodes).forEach((nodeKey)=> {
			if (!schemaNodes[nodeKey]) { delete schemaNodes[nodeKey]; }
		});
		Object.keys(schemaMarks).forEach((markKey)=> {
			if (!schemaMarks[markKey]) { delete schemaMarks[markKey]; }
		});

		return new Schema({
			nodes: schemaNodes,
			marks: schemaMarks,
			topNode: 'doc'
		});
	}

	configurePlugins() {
		const allPlugins = {
			...optionalPlugins,
			...this.props.customPlugins,
			...requiredPlugins,
		};

		return Object.keys(allPlugins).filter((key)=> {
			return !!allPlugins[key];
		}).sort((foo, bar)=> {
			if (foo === 'onChange') { return 1; }
			if (bar === 'onChange') { return -1; }
			return 0;
		}).map((key)=> {
			const passedProps = {
				container: this.editorRef.current,
				onChange: this.props.onChange,
				collaborativeOptions: this.props.collaborativeOptions,
				placeholder: this.props.placeholder,
				isReadOnly: this.props.isReadOnly,
				getHighlights: ()=> {
					return this.props.highlights;
				},
				getHighlightContent: this.props.getHighlightContent,
			};
			return allPlugins[key](this.schema, passedProps);
		}).reduce((prev, curr)=> {
			/* Some plugin generation functions return an */
			/* array of plugins. Flatten those cases. */
			return prev.concat(curr);
		}, []);
	}

	configureNodeViews() {
		const nodeViews = {};
		const usedNodes = this.schema.nodes;
		Object.keys(usedNodes).forEach((nodeName) => {
			const nodeSpec = usedNodes[nodeName].spec;
			if (nodeSpec.isNodeView) {
				nodeViews[nodeName] = (node, view, getPos, decorations)=>{
					const customOptions = this.props.nodeOptions[nodeName] || {};
					const mergedOptions = { ...nodeSpec.defaultOptions, ...customOptions };
					return new NodeViewReact(node, view, getPos, decorations, mergedOptions);
				};
			}
		});

		return nodeViews;
	}


	createEditor() {
		/* Create the Editor State */
		const state = EditorState.create({
			doc: this.schema.nodeFromJSON(this.props.initialContent),
			schema: this.schema,
			plugins: this.plugins,
		});

		/* Create and editorView and mount it into the editorRef node */
		const editorView = new EditorView({ mount: this.editorRef.current }, {
			state: state,
			spellcheck: true,
			editable: () => { return !this.props.isReadOnly; },
			nodeViews: this.nodeViews,
			handleKeyDown: keydownHandler({
				/* Block Ctrl-S from launching the browser Save window */
				'Mod-s': ()=>{
					return true;
				},
				// TODO: We need something here that allows the dev to
				// disable certain keys when a inline-menu is open for example
			})
		});

		const emptyInitTransaction = editorView.state.tr;
		editorView.dispatch(emptyInitTransaction);
	}

	render() {
		/* Before createEditor is called from componentDidMount, we */
		/* render a static version of the doc for server-side */
		/* friendliness. This static version is overwritten when the */
		/* editorView is mounted into the editor dom node. */
		return (
			<div className="editor" ref={this.editorRef}>
				<div className="ProseMirror">
					{renderStatic(this.schema, this.props.initialContent.content, this.props)}
				</div>
			</div>
		);
	}
}

Editor.propTypes = propTypes;
Editor.defaultProps = defaultProps;
export default Editor;
