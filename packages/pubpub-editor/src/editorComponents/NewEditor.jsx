import React, { Component, PropTypes } from 'react';

// import ReactDOM from 'react-dom';
import { createRichMention } from '../menus/Autocomplete/autocompleteConfig';
import { getPlugin } from '../prosemirror-setup/plugins';
import { schema } from '../prosemirror-setup/schema';

/*
 * Find and return all matched children by type. `type` can be a React element class or
 * string
 */
 const findAllByType = (children, type) => {
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
const findChildByType = (children, type) => {
  const result = findAllByType(children, type);

  return result && result[0];
};


class ViewProvider extends Component {
  static propTypes = {
    view: PropTypes.object.isRequired,
		editorState: PropTypes.object.isRequired,
		containerId: PropTypes.string.isRequired,
  }
  render() {
		const { view, containerId, editorState, children } = this.props;
    return <div>
			{ React.Children.map(children, (child => React.cloneElement(child, { view, containerId, editorState } )))}
		</div>;
  }
}

const RichEditor = React.createClass({
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
		this.props.onChange(this.view.state.doc.toJSON());
		React.Children.forEach(this.props.children, (child) => {
			console.log(child, child.onChange, child.ref);
			if (child.onChange) {
				child.onChange();
			}
		});
	},

	onCursorChange() {
		React.Children.forEach(this.props.children, (child) => {
			if (child.onCursorChange) {
				child.onCursorChange();
			}
		});
	},

	updateMentions(mentionInput) {
		React.Children.forEach(this.props.children, (child) => {
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

		const { pubpubSetup } = require('../prosemirror-setup/setup');

		const { collaborative, trackChanges, firebaseConfig, editorKey, clientID } = this.props;
		const { CitationsPlugin, MentionsPlugin, SelectPlugin, TrackPlugin, FirebasePlugin } = require('../prosemirror-setup/plugins');
		const { collab } = require('prosemirror-collab');

		let plugins = pubpubSetup({ schema })
		.concat(CitationsPlugin)
		.concat(SelectPlugin)
		.concat(MentionsPlugin);

		if (collaborative) {
			plugins = plugins.concat(FirebasePlugin({selfClientID: clientID, editorKey, firebaseConfig, updateCommits: this.props.updateCommits}))
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
		// migrateMarks(contents);

		// create({ place, contents, plugins, props, config, components: { suggestComponent } = {}, handlers: { createFile, onChange, captureError, updateMentions } }) {
		const { clipboardParser, clipboardSerializer, transformPastedHTML } = require('../prosemirror-setup/clipboard');

		const { buildMenuItems } = require('../prosemirror-setup/menu-config');
		const { EditorState } = require('prosemirror-state');
		const { EditorView } = require('prosemirror-view');

		const configureNodeViews = require('../prosemirror-setup/rich-nodes/configureNodeViews').default;

		const menu = buildMenuItems(schema);
		const plugins = this.configurePlugins();

		const config = {
			referencesList: this.props.localFiles,
			trackChanges: this.props.trackChanges,
			rebaseChanges: this.props.rebaseChanges,
			updateCommits: this.props.updateCommits,
		};

		this.plugins = plugins;

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

		this.setState({view: this.view});
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

	fork(forkID) {
		let firebasePlugin;
		if (firebasePlugin = getPlugin('firebase', this.view.state)) {
			return firebasePlugin.props.fork.bind(firebasePlugin)(forkID);
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


	getForks() {
		let firebasePlugin;
		if (firebasePlugin = getPlugin('firebase', this.view.state)) {
			return firebasePlugin.props.getForks.bind(firebasePlugin)();
		}
		return Promise.resolve(null);
	},

	_onAction (transaction) {
		if (!this.view || !this.view.state) {
			return;
		}

		const newState = this.view.state.apply(transaction);
		this.view.updateState(newState);


		this.setState({editorState: newState});

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
				{(this.state.view) ?
					<ViewProvider view={this.state.view} editorState={this.state.editorState} containerId="rich-editor-container">
						{this.props.children}
					</ViewProvider>
					: null
				}

				<div className="pubEditor" id="pubEditor" />
			</div>
		);
	}

});

export default RichEditor;
