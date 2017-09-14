import React, { Component, PropTypes } from 'react';

import EditorProvider from './EditorProvider';
import { EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { configureClipboard } from '../schema/setup/clipboard';
import configureNodeViews from '../schema/editable/configure';
import { createRichMention } from '../addons/Autocomplete/autocompleteConfig';
import { createSchema } from '../schema';
import { getBasePlugins } from '../schema/setup';
import { getPlugin } from '../schema/plugins';

const Editor = React.createClass({
	propTypes: {
		initialContent: PropTypes.object,
		onChange: PropTypes.func,
		handleFileUpload: PropTypes.func,
		handleReferenceAdd: PropTypes.func,
		trackChanges: PropTypes.bool,
	},

	getInitialState() {
		return {
		};
	},

	componentWillMount() {
	},

	componentDidMount() {
		this.createEditor();
	},

	componentDidUpdate(prevProps, prevState) {
		if (prevProps.editorKey !== this.props.editorKey) {
			this.createEditor();
		}
	},

	onChange() {
		this.props.onChange(this.view.state.doc.toJSON());
	},

	getJSON() {
		return this.editor.toJSON();
	},

	configurePlugins() {
    const { trackChanges } = this.props;
    const schema = createSchema();

		let plugins = getBasePlugins({ schema });
		if (this.props.children && this.props.children.length > 0) {
			for (const child of this.props.children) {
				if (child.type.getPlugins) {
					plugins = plugins.concat(child.type.getPlugins(child.props));
				}
			}
		}
		if (trackChanges) {
			plugins = plugins.concat(TrackPlugin);
		}

		return plugins;
	},

	createEditor() {
		if (this.view) {
			this.remove();
		}

		// const place = ReactDOM.findDOMNode(this.refs.container);
    const schema = createSchema();
		const place = document.getElementById('pubEditor');

		const contents = this.props.initialContent;
		const plugins = this.configurePlugins();

		const config = {
			referencesList: this.props.localFiles,
			trackChanges: this.props.trackChanges,
			rebaseChanges: this.props.rebaseChanges,
			updateCommits: this.props.updateCommits,
		};

		const stateConfig = {
			doc: (contents) ? schema.nodeFromJSON(contents) : schema.nodes.doc.create(),
			schema: schema,
			plugins: plugins,
			...config
		};

    const { clipboardParser, clipboardSerializer, transformPastedHTML } = configureClipboard({schema});

		const state = EditorState.create(stateConfig);
		const editorView = document.createElement('div');
		editorView.className = 'pub-body';
		place.appendChild(editorView);

		const props = {
			referencesList: this.props.localFiles,
			createFile: this.props.handleFileUpload,
			createReference: this.props.handleReferenceAdd,
			captureError: this.props.onError,
			onChange: this.onChange,
			updateCommits: this.props.updateCommits,
			createFile: this.props.handleFileUpload,
			captureError: this.props.onError,
			updateMentions: this.updateMentions,
		};

		this.view = new EditorView(editorView, {
			state: state,
			dispatchTransaction: this._onAction,
			spellcheck: true,
			clipboardSerializer: clipboardSerializer,
			transformPastedHTML: transformPastedHTML,
			handleDOMEvents: {
				dragstart: (view, evt) => {
					evt.preventDefault();
					return true;
				},
			},
			viewHandlers: {
				updateMentions: this.updateMentions,
			},
			nodeViews: configureNodeViews,
			...props
		});

		this.setState({view: this.view, editorState: state});
	},

	updateMentions(mentionInput) {
		if (mentionInput) {
			setTimeout(()=>{
				const container = document.getElementById('rich-editor-container');
				const mark = document.getElementsByClassName('mention-marker')[0];
				if (!container || !mark) {
					return this.setState({ visible: false });
				}
				const top = mark.getBoundingClientRect().bottom - container.getBoundingClientRect().top;
				const left = mark.getBoundingClientRect().left - container.getBoundingClientRect().left;
				this.setState({
					visible: true,
					top: top,
					left: left,
					input: mentionInput,
				});
			}, 0);
		} else {
			this.setState({ visible: false });
		}
	},

	onMentionSelection: function(selectedObject) {
		const mentionPos = this.editor.getMentionPos();
		createRichMention(this.editor, selectedObject, mentionPos.start, mentionPos.end);
	},


	remove() {
		if (this.view) {
			this.view.destroy();
		}
	},

	getMentionPos() {
		let mentionsPlugin;
		if (mentionsPlugin = getPlugin('mentions', this.view.state)) {
			return mentionsPlugin.props.getMentionPos(this.view);
		}
		return null;
	},

	getTrackedSteps() {
		let trackPlugin;
		if (trackPlugin = getPlugin('track', this.view.state)) {
			const steps =  trackPlugin.props.getTrackedSteps.bind(trackPlugin)(this.view);
			return steps;
		}
		return null;
	},

	rebaseSteps(steps) {
		let rebasePlugin;
		if (rebasePlugin = getPlugin('rebase', this.view.state)) {
			return rebasePlugin.props.rebaseSteps.bind(rebasePlugin)(this.view, steps);
		}
		return Promise.resolve(null);
	},

	rebase(forkID) {
		let firebasePlugin;
		if (firebasePlugin = getPlugin('firebase', this.view.state)) {
			return firebasePlugin.props.rebase.bind(firebasePlugin)(forkID);
		}
		return Promise.resolve(null);
	},

	rebaseByCommit(forkID) {
		let firebasePlugin;
		if (firebasePlugin = getPlugin('firebase', this.view.state)) {
			return firebasePlugin.props.rebaseByCommit.bind(firebasePlugin)(forkID);
		}
		return Promise.resolve(null);
	},

	commit(msg) {
		let firebasePlugin;
		if (firebasePlugin = getPlugin('firebase', this.view.state)) {
			return firebasePlugin.props.commit.bind(firebasePlugin)(msg);
		}
		return Promise.resolve(null);
	},


	_onAction (transaction) {
		if (!this.view || !this.view.state) {
			return;
		}
		const newState = this.view.state.apply(transaction);
		this.view.updateState(newState);
		this.setState({editorState: newState, transaction: transaction});
	},

	render: function() {

		return (
			<div style={{ position: 'relative', width: '100%', minHeight: 250 }} id={'rich-editor-container'}>
				{(this.state.view) ?
					<EditorProvider view={this.state.view} editorState={this.state.editorState} transaction={this.state.transaction} containerId="rich-editor-container">
						{this.props.children}
					</EditorProvider>
					: null
				}

				<div className="pubEditor" id="pubEditor" />
			</div>
		);
	}

});

export default Editor;
