import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { keydownHandler } from 'prosemirror-keymap';
import { requiredPlugins, optionalPlugins } from './plugins';
import { renderStatic, buildSchema } from './utils';

require('./styles/base.scss');

const propTypes = {
	customNodes:
		PropTypes.object /* Object of custom nodes. To remove default node, override. For example, { image: null, header: null } */,
	customMarks: PropTypes.object,
	customPlugins:
		PropTypes.object /* All customPlugins values should be a function, which is passed schema and props - and returns a Plugin */,
	nodeOptions:
		PropTypes.object /* An object with nodeName keys and values of objects of overriding options. For example: nodeOptions = { image: { linkToSrc: false } } */,
	collaborativeOptions: PropTypes.object,
	onChange: PropTypes.func,
	onError: PropTypes.func,
	initialContent: PropTypes.object,
	placeholder: PropTypes.string,
	isReadOnly: PropTypes.bool,
	highlights: PropTypes.array,
	getHighlightContent: PropTypes.func,
	handleSingleClick: PropTypes.func,
	handleDoubleClick: PropTypes.func,
};

const defaultProps = {
	customNodes: {} /* defaults: 'blockquote', 'horizontal_rule', 'heading', 'ordered_list', 'bullet_list', 'list_item', 'code_block', 'text', 'hard_break', 'image' */,
	customMarks: {} /* defaults: 'em', 'strong', 'link', 'sub', 'sup', 'strike', 'code' */,
	customPlugins: {} /* defaults: inputRules, keymap, headerIds, placeholder */,
	nodeOptions: {},
	collaborativeOptions: {},
	onChange: () => {},
	onError: () => {},
	initialContent: { type: 'doc', attrs: { meta: {} }, content: [{ type: 'paragraph' }] },
	placeholder: '',
	isReadOnly: false,
	highlights: [],
	getHighlightContent: () => {},
	handleSingleClick: undefined,
	handleDoubleClick: undefined,
};

class Editor extends Component {
	constructor(props) {
		super(props);

		this.configurePlugins = this.configurePlugins.bind(this);
		this.createEditor = this.createEditor.bind(this);

		this.editorRef = React.createRef();
		this.schema = buildSchema(
			this.props.customNodes,
			this.props.customMarks,
			this.props.nodeOptions,
		);
		this.plugins = undefined;
	}

	componentDidMount() {
		this.plugins = this.configurePlugins();
		this.createEditor();
	}

	shouldComponentUpdate() {
		return false;
	}

	configurePlugins() {
		const allPlugins = {
			...optionalPlugins,
			...this.props.customPlugins,
			...requiredPlugins,
		};

		return Object.keys(allPlugins)
			.filter((key) => {
				return !!allPlugins[key];
			})
			.sort((foo, bar) => {
				if (foo === 'onChange') {
					return 1;
				}
				if (bar === 'onChange') {
					return -1;
				}
				return 0;
			})
			.map((key) => {
				const passedProps = {
					container: this.editorRef.current,
					onChange: this.props.onChange,
					onError: this.props.onError,
					initialContent: this.props.initialContent,
					collaborativeOptions: this.props.collaborativeOptions,
					placeholder: this.props.placeholder,
					isReadOnly: this.props.isReadOnly,
					getHighlights: () => {
						return this.props.highlights;
					},
					getHighlightContent: this.props.getHighlightContent,
				};
				return allPlugins[key](this.schema, passedProps);
			})
			.reduce((prev, curr) => {
				/* Some plugin generation functions return an */
				/* array of plugins. Flatten those cases. */
				return prev.concat(curr);
			}, []);
	}

	createEditor() {
		/* Create the Editor State */
		const state = EditorState.create({
			doc: this.schema.nodeFromJSON(this.props.initialContent),
			schema: this.schema,
			plugins: this.plugins,
		});

		/* Create and editorView and mount it into the editorRef node */
		const editorView = new EditorView(
			{ mount: this.editorRef.current },
			{
				state: state,
				spellcheck: true,
				editable: () => {
					return !this.props.isReadOnly;
				},
				handleKeyDown: keydownHandler({
					/* Block Ctrl-S from launching the browser Save window */
					'Mod-s': () => {
						return true;
					},
					// TODO: We need something here that allows the dev to
					// disable certain keys when a inline-menu is open for example
				}),
				handleClickOn: this.props.handleSingleClick,
				handleDoubleClickOn: this.props.handleDoubleClick,
				dispatchTransaction: (transaction) => {
					try {
						const newState = editorView.state.apply(transaction);
						editorView.updateState(newState);
					} catch (err) {
						console.error('Error applying transaction:', err);
						this.props.onError(err);
					}
				},
			},
		);

		const emptyInitTransaction = editorView.state.tr;
		editorView.dispatch(emptyInitTransaction);
	}

	render() {
		/* Before createEditor is called from componentDidMount, we */
		/* generate a static version of the doc for server-side rendering. */
		/* This static version is overwritten when the editorView is */
		/* mounted into the editor dom node. */
		return (
			<div
				ref={this.editorRef}
				className={`editor ProseMirror ${this.props.isReadOnly ? 'read-only' : ''}`}
			>
				{renderStatic(this.schema, this.props.initialContent.content, this.props)}
			</div>
		);
	}
}

Editor.propTypes = propTypes;
Editor.defaultProps = defaultProps;
export default Editor;
