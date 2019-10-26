// import React, { Component } from 'react';
import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { keydownHandler } from 'prosemirror-keymap';
import { collab, receiveTransaction, sendableSteps } from 'prosemirror-collab';
import { getPlugins } from './plugins';
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
	collaborativeOptions: {
		onStatusChange: () => {},
		onUpdateLatestKey: () => {},
	},
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

/*
Client1 sends to authority
	Writes transaction
If the step client1 seen most recently is known to be outdated, just do nothing
	If transaction fails, because that index already exists, just exit
Client1 is about to recieve new steps, which will trigger a new send
	

If there is an ongoing authority sync,
Don't send new ones.
Supposedly, a new transaction will come in to receive self-steps once current authority
sync finishes, which will trigger the stuff to resend.



Client1 sends transaction
While transaction pending, it recieves a new value
New value triggers view to run again
Transaction fails

Maybe we have something like:
Start transaction
On recieve new steps, if ongoing transaction, store steps
	Else, process steps
on transaction fail, process any stored steps
*/

// let ongoingTransaction;
// const authoritySteps = [];
// const schema = buildSchema(props.customNodes, props.customMarks, props.nodeOptions);

// const sendToAuthority = (newState, view) => {
// 	const lastStep = 0;
// 	const sendable = sendableSteps(newState);
// 	console.log('Sendable are:', sendable, ongoingTransaction);

// 	// authority.receiveSteps(sendable.version, sendable.steps, sendable.clientID);
// 	if (!ongoingTransaction) {
// 		console.log('About to send transaction');
// 		ongoingTransaction = true;
// 		setTimeout(() => {
// 			if (sendable) {
// 				console.log('Sending recieve');
// 				authoritySteps.push(sendable.steps);
// 				ongoingTransaction = false;
// 				console.log(authoritySteps);
// 				view.dispatch(
// 					receiveTransaction(
// 						view.state,
// 						sendable.steps,
// 						sendable.steps.map(() => sendable.clientID),
// 					),
// 				);
// 			} else {
// 				ongoingTransaction = false;
// 			}
// 		}, 1000);
// 	} else {
// 		console.log('On going transaction, will end.');
// 	}
// };
// const schema = schema.nodeFromJSON(props.initialContent);

// plugins: this.plugins,
// plugins: [collab.collab({version: authority.steps.length})]
// plugins: [
// 	collab({
// 		clientID: 'testId',
// 	}),
// ],

const Editor = (props) => {
	const editorRef = useRef();
	const schema = buildSchema(props.customNodes, props.customMarks, props.nodeOptions);

	useEffect(() => {
		const state = EditorState.create({
			doc: schema.nodeFromJSON(props.initialContent),
			schema: schema,
			plugins: getPlugins(schema, props),
		});

		const view = new EditorView(
			{ mount: editorRef.current },
			{
				state: state,
				dispatchTransaction: (transaction) => {
					const newState = view.state.apply(transaction);
					view.updateState(newState);
					if (props.collaborativeOptions.firebaseRef) {
						state.collaborative$.sendCollabChanges(transaction, newState);
					}
				},
			},
		);
	}, []);

	return (
		<div
			ref={editorRef}
			className={`editor ProseMirror ${props.isReadOnly ? 'read-only' : ''}`}
		/>
	);
};

// class EditorOld extends Component {
// 	constructor(props) {
// 		super(props);

// 		this.configurePlugins = this.configurePlugins.bind(this);
// 		this.createEditor = this.createEditor.bind(this);

// 		this.editorRef = React.createRef();
// 		this.schema = buildSchema(
// 			this.props.customNodes,
// 			this.props.customMarks,
// 			this.props.nodeOptions,
// 		);
// 		this.plugins = undefined;
// 	}

// 	componentDidMount() {
// 		this.plugins = this.configurePlugins();
// 		this.createEditor();
// 	}

// 	shouldComponentUpdate() {
// 		return false;
// 	}

// 	configurePlugins() {
// 		const allPlugins = {
// 			...optionalPlugins,
// 			...this.props.customPlugins,
// 			...requiredPlugins,
// 		};

// 		return Object.keys(allPlugins)
// 			.filter((key) => {
// 				return !!allPlugins[key];
// 			})
// 			.sort((foo, bar) => {
// 				if (foo === 'onChange') {
// 					return 1;
// 				}
// 				if (bar === 'onChange') {
// 					return -1;
// 				}
// 				return 0;
// 			})
// 			.map((key) => {
// 				const passedProps = {
// 					container: this.editorRef.current,
// 					onChange: this.props.onChange,
// 					onError: this.props.onError,
// 					initialContent: this.props.initialContent,
// 					collaborativeOptions: this.props.collaborativeOptions,
// 					placeholder: this.props.placeholder,
// 					isReadOnly: this.props.isReadOnly,
// 					getHighlights: () => {
// 						return this.props.highlights;
// 					},
// 					getHighlightContent: this.props.getHighlightContent,
// 				};
// 				return allPlugins[key](this.schema, passedProps);
// 			})
// 			.reduce((prev, curr) => {
// 				/* Some plugin generation functions return an */
// 				/* array of plugins. Flatten those cases. */
// 				return prev.concat(curr);
// 			}, []);
// 	}

// 	createEditor() {
// 		/* Create the Editor State */
// 		const state = EditorState.create({
// 			doc: this.schema.nodeFromJSON(this.props.initialContent),
// 			schema: this.schema,
// 			plugins: this.plugins,
// 		});

// 		/* Create and editorView and mount it into the editorRef node */
// 		const editorView = new EditorView(
// 			{ mount: this.editorRef.current },
// 			{
// 				state: state,
// 				spellcheck: true,
// 				editable: () => {
// 					return !this.props.isReadOnly;
// 				},
// 				handleKeyDown: keydownHandler({
// 					/* Block Ctrl-S from launching the browser Save window */
// 					'Mod-s': () => {
// 						return true;
// 					},
// 					// TODO: We need something here that allows the dev to
// 					// disable certain keys when a inline-menu is open for example
// 				}),
// 				handleClickOn: this.props.handleSingleClick,
// 				handleDoubleClickOn: this.props.handleDoubleClick,
// 				dispatchTransaction: (transaction) => {
// 					try {
// 						const newState = editorView.state.apply(transaction);
// 						editorView.updateState(newState);
// 					} catch (err) {
// 						console.error('Error applying transaction:', err);
// 						this.props.onError(err);
// 					}
// 				},
// 			},
// 		);

// 		const emptyInitTransaction = editorView.state.tr;
// 		editorView.dispatch(emptyInitTransaction);
// 	}

// 	render() {
// 		/* Before createEditor is called from componentDidMount, we */
// 		/* generate a static version of the doc for server-side rendering. */
// 		/* This static version is overwritten when the editorView is */
// 		/* mounted into the editor dom node. */
// 		return (
// 			<div
// 				ref={this.editorRef}
// 				className={`editor ProseMirror ${this.props.isReadOnly ? 'read-only' : ''}`}
// 			>
// 				{renderStatic(this.schema, this.props.initialContent.content, this.props)}
// 			</div>
// 		);
// 	}
// }

Editor.propTypes = propTypes;
Editor.defaultProps = defaultProps;
export default Editor;
