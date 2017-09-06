import React, { PropTypes, Component } from 'react';

// import ReactDOM from 'react-dom';
import { createRichMention } from '../Autocomplete/autocompleteConfig';
import { getPlugin } from '../prosemirror-setup/plugins';

import { schema } from '../schema';

/*
 * Find and return all matched children by type. `type` can be a React element class or
 * string
 */
export const findAllByType = (children, type) => {
  const result = [];
  let types = [];

  if (_.isArray(type)) {
    types = type.map(t => getDisplayName(t));
  } else {
    types = [getDisplayName(type)];
  }

  React.Children.forEach(children, (child) => {
    const childType = child && child.type && (child.type.displayName || child.type.name);
    if (types.indexOf(childType) !== -1) {
      result.push(child);
    }
  });

  return result;
};
/*
 * Return the first matched child by type, return null otherwise.
 * `type` can be a React element class or string.
 */
export const findChildByType = (children, type) => {
  const result = findAllByType(children, type);

  return result && result[0];
};


class ViewProvider extends Component {
  static propTypes = {
    view: PropTypes.object.isRequired,
  }
  // you must specify what you’re adding to the context
  static childContextTypes = {
    view: PropTypes.object.isRequired,
  }
  getChildContext() {
   const { view, containerId } = this.props
   return { view, containerId };
  }
  render() {
    // `Children.only` enables us not to add a <div /> for nothing
    return Children.only(this.props.children)
  }
}

export const RichEditor = React.createClass({
	propTypes: {
		initialContent: PropTypes.object,
		onChange: PropTypes.func,
		handleFileUpload: PropTypes.func,
		handleReferenceAdd: PropTypes.func,
		/*
			Where to create forks?
		*/
		collaborative: PropTypes.shape({
	    color: PropTypes.string,
	    fontSize: PropTypes.number
	  }),
		trackChanges: PropTypes.bool,
	},

	getInitialState() {
		return {
		};
	},

	componentWillMount() {
	},

	componentDidMount() {
		this.createEditor(null);
	},

	componentDidUpdate(prevProps, prevState) {
		if (prevProps.editorKey !== this.props.editorKey) {
			this.createEditor(null);
		}
	},


	onChange() {
		this.props.onChange(this.editor.view.state.doc.toJSON());
		React.Children.forEach(children, (child) => {
			if (child.onChange) {
				child.onChange();
			}
		});
	},

	onCursorChange() {
		React.Children.forEach(children, (child) => {
			if (child.onCursorChange) {
				child.onCursorChange();
			}
		});
	},

	updateMentions(mentionInput) {
		React.Children.forEach(children, (child) => {
			if (child.updateMentions) {
				child.updateMentions(mentionInput);
			}
		});
	},

	getMarkdown() {
		return this.editor.toMarkdown();
	},

	getJSON() {
		return this.editor.toJSON();
	},

	configurePlugins() {

		const { collaborative, trackChanges, editorKey, firebaseConfig, editorKey, clientID } = this.props;
		const { CitationsPlugin, FootnotesPlugin, MentionsPlugin, SelectPlugin, TrackPlugin, FirebasePlugin } = require('../plugins');

		let plugins = pubpubSetup({ schema })
		.concat(CitationsPlugin)
		.concat(SelectPlugin)
		.concat(MentionsPlugin);

		if (collaborative) {
			plugins = plugins.concat(FirebasePlugin({selfClientID: clientID, editorKey, firebaseConfig, updateCommits: config.updateCommits}))
			.concat(collab({clientID: clientID}));
		}
		if (trackChanges) {
			plugins = plugins.concat(TrackPlugin);
		}

		return plugins;

	},

	createEditor(docJSON) {
		if (this.view) {
			this.remove();
		}

		// const place = ReactDOM.findDOMNode(this.refs.container);
		const place = document.getElementById('pubEditor');

		const contents = this.props.initialContent;
		migrateMarks(contents);

		// create({ place, contents, plugins, props, config, components: { suggestComponent } = {}, handlers: { createFile, onChange, captureError, updateMentions } }) {
		const { clipboardParser, clipboardSerializer, transformPastedHTML } = require('../clipboard');

		const { buildMenuItems } = require('../menu-config');
		const { EditorState } = require('prosemirror-state');
		const { EditorView } = require('prosemirror-view');

		const configureNodeViews = require('../prosemirror-setup/rich-nodes/configureNodeViews');

		const menu = buildMenuItems(pubSchema);

		this.plugins = plugins;
		this.handlers = { createFile, onChange, captureError };

		const stateConfig = {
			doc: (contents) ? schema.nodeFromJSON(contents) : undefined,
			schema: schema,
			plugins: plugins,
			...config
		};

		const state = EditorState.create(stateConfig);
		const editorView = document.createElement('div');
		editorView.className = 'pub-body';
		place.appendChild(editorView);

		const { editorKey, firebaseConfig } = config;

		const plugins = this.configurePlugins();
		const nodeViews = this.configurePlugins();

		const props = {
			referencesList: this.props.localFiles,
			createFile: this.props.handleFileUpload,
			createReference: this.props.handleReferenceAdd,
			captureError: this.props.onError,
			onChange: this.onChange,
			onCursor: this.onCursorChange,
			updateCommits: this.props.updateCommits,
			createFile: this.props.handleFileUpload,
			captureError: this.props.onError,
			updateMentions: this.updateMentions,
		};

		this.view = new EditorView(editorView, {
			state: state,
			dispatchTransaction: this._onAction,
			spellcheck: true,
			clipboardParser: markdownParser,
			clipboardSerializer: clipboardSerializer,
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
			nodeViews: configureNodeViews(),
			...props
		});

		return this.view;
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
		return null;
	},

	fork(forkID) {
		let firebasePlugin;
		if (firebasePlugin = getPlugin('firebase', this.view.state)) {
			return firebasePlugin.props.fork.bind(firebasePlugin)(forkID);
		}
		return null;
	},

	rebase(forkID) {
		let firebasePlugin;
		if (firebasePlugin = getPlugin('firebase', this.view.state)) {
			return firebasePlugin.props.rebase.bind(firebasePlugin)(forkID);
		}
		return null;
	},

	rebaseByCommit(forkID) {
		let firebasePlugin;
		if (firebasePlugin = getPlugin('firebase', this.view.state)) {
			return firebasePlugin.props.rebaseByCommit.bind(firebasePlugin)(forkID);
		}
		return null;
	},

	commit(msg) {
		let firebasePlugin;
		if (firebasePlugin = getPlugin('firebase', this.view.state)) {
			return firebasePlugin.props.commit.bind(firebasePlugin)(msg);
		}
		return null;
	},


	getForks() {
		let firebasePlugin;
		if (firebasePlugin = getPlugin('firebase', this.view.state)) {
			return firebasePlugin.props.getForks.bind(firebasePlugin)();
		}
		return null;
	},

	_onAction (transaction) {
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

		// const trackPlugin = getPlugin('track', this.view.state);
		const firebasePlugin = getPlugin('firebase', this.view.state);
		if (firebasePlugin) {
			if (!transaction.getMeta("rebase") ) {
				return firebasePlugin.props.updateCollab(transaction, newState);
			}
		}
	},

	render: function() {

		return (
			<div style={{ position: 'relative' }} id={'rich-editor-container'}>
				<ViewProvider view={this.view} containerId="rich-editor-container">
					{this.props.children}
				</ViewProvider>
				<div className="pubEditor" id="pubEditor" />
			</div>
		);
	}

});

export default RichEditor;
