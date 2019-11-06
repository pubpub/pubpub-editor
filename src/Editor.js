import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { keydownHandler } from 'prosemirror-keymap';
import { getPlugins } from './plugins';
import { collabDocPluginKey } from './plugins/collaborative';
import { getChangeObject } from './plugins/onChange';
import { renderStatic, buildSchema } from './utils';

require('./styles/base.scss');

const propTypes = {
	/* Object of custom nodes. To remove default node, override. For example, { image: null, header: null } */
	customNodes: PropTypes.object,
	customMarks: PropTypes.object,
	/* All customPlugins values should be a function, which is passed schema and props - and returns a Plugin */
	customPlugins: PropTypes.object,
	/* An object with nodeName keys and values of objects of overriding options. For example: nodeOptions = { image: { linkToSrc: false } } */
	nodeOptions: PropTypes.object,
	collaborativeOptions: PropTypes.object,
	onChange: PropTypes.func,
	onError: PropTypes.func,
	initialContent: PropTypes.object,
	placeholder: PropTypes.string,
	isReadOnly: PropTypes.bool,
	handleSingleClick: PropTypes.func,
	handleDoubleClick: PropTypes.func,
};

const defaultProps = {
	customNodes: {}, // defaults: 'blockquote', 'horizontal_rule', 'heading', 'ordered_list', 'bullet_list', 'list_item', 'code_block', 'text', 'hard_break', 'image'
	customMarks: {}, // defaults: 'em', 'strong', 'link', 'sub', 'sup', 'strike', 'code'
	customPlugins: {}, // defaults: inputRules, keymap, headerIds, placeholder
	nodeOptions: {},
	collaborativeOptions: {},
	onChange: () => {},
	onError: () => {},
	initialContent: { type: 'doc', attrs: { meta: {} }, content: [{ type: 'paragraph' }] },
	placeholder: '',
	isReadOnly: false,
	handleSingleClick: undefined,
	handleDoubleClick: undefined,
};

const Editor = (props) => {
	const editorRef = useRef();
	const schema = useRef(null);

	if (schema.current === null) {
		schema.current = buildSchema(props.customNodes, props.customMarks, props.nodeOptions);
	}

	useEffect(() => {
		const state = EditorState.create({
			doc: schema.current.nodeFromJSON(props.initialContent),
			schema: schema.current,
			plugins: getPlugins(schema.current, {
				customPlugins: props.customPlugins,
				collaborativeOptions: props.collaborativeOptions,
				onChange: props.onChange,
				onError: props.onError,
				initialContent: props.initialContent,
				placeholder: props.placeholder,
				isReadOnly: props.isReadOnly,
			}),
		});

		const view = new EditorView(
			{ mount: editorRef.current },
			{
				state: state,
				editable: (editorState) => {
					const collaborativePluginState = collabDocPluginKey.getState(editorState) || {};
					if (
						props.collaborativeOptions.clientData &&
						!collaborativePluginState.isLoaded
					) {
						return false;
					}
					return !props.isReadOnly;
				},
				handleKeyDown: keydownHandler({
					/* Block Ctrl-S from launching the browser Save window */
					'Mod-s': () => {
						return true;
					},
				}),
				handleClickOn: props.handleSingleClick,
				handleDoubleClickOn: props.handleDoubleClick,
				dispatchTransaction: (transaction) => {
					try {
						const newState = view.state.apply(transaction);
						view.updateState(newState);
						if (props.collaborativeOptions.firebaseRef) {
							collabDocPluginKey.getState(newState).sendCollabChanges(newState);
						}
					} catch (err) {
						console.error('Error applying transaction:', err);
						props.onError(err);
					}
				},
			},
		);

		props.onChange(getChangeObject(view));
	}, []);

	/* Before createEditor is called from componentDidMount, we */
	/* generate a static version of the doc for server-side rendering. */
	/* This static version is overwritten when the editorView is */
	/* mounted into the editor dom node. */
	return (
		<div
			ref={editorRef}
			className={`editor ProseMirror ${props.isReadOnly ? 'read-only' : ''}`}
		>
			{renderStatic(schema.current, props.initialContent.content, props)}
		</div>
	);
};

Editor.propTypes = propTypes;
Editor.defaultProps = defaultProps;
export default Editor;
