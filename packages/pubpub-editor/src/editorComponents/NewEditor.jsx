import React, { PropTypes, Component } from 'react';

import Autocomplete from '../Autocomplete/Autocomplete';
import { FirebaseEditor } from '../prosemirror-setup/editors/firebaseEditor';
import FormattingMenu from '../FormattingMenu/FormattingMenu';
import InsertMenu from '../InsertMenu/InsertMenu';
import { RichEditor as ProseEditor } from '../prosemirror-setup';
import TableMenu from '../TableMenu/TableMenu';
// import ReactDOM from 'react-dom';
import { createRichMention } from '../Autocomplete/autocompleteConfig';ß


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

	createEditor(docJSON) {
		if (this.editor) {
			this.editor.remove();
		}

		// const place = ReactDOM.findDOMNode(this.refs.container);
		const place = document.getElementById('pubEditor');
		const fileMap = this.generateFileMap();

		const contents = this.props.initialContent;
		migrateMarks(contents);

		const EditorClass = (this.props.collaborative) ? FirebaseEditor : ProseEditor;

		this.editor = new EditorClass({
			place: place,
			contents: contents,
			config: {
				fileMap: fileMap,
				referencesList: this.props.localFiles,
				trackChanges: this.props.trackChanges,
				rebaseChanges: this.props.rebaseChanges,
				editorKey: (this.props.collaborative) ? this.props.editorKey : null,
				firebaseConfig: this.props.firebaseConfig,
				updateCommits: this.props.updateCommits,
			},
			props: {
				fileMap: fileMap,
				referencesList: this.props.localFiles,
				createFile: this.props.handleFileUpload,
				createReference: this.props.handleReferenceAdd,
				captureError: this.props.onError,
				onChange: this.onChange,
				onCursor: this.onCursorChange,
				updateMentions: this.updateMentions,
			},
			handlers: {
				createFile: this.props.handleFileUpload,
				captureError: this.props.onError,
				updateMentions: this.updateMentions,
			}
		});

		create({ place, contents, plugins, props, config, components: { suggestComponent } = {}, handlers: { createFile, onChange, captureError, updateMentions } }) {
			const { clipboardParser, clipboardSerializer, transformPastedHTML } = require('../clipboard');

			const { buildMenuItems } = require('../menu-config');
			const { EditorState } = require('prosemirror-state');
			const { EditorView } = require('prosemirror-view');

			const menu = buildMenuItems(pubSchema);
			// TO-DO: USE UNIQUE ID FOR USER AND VERSION NUMBER

			this.plugins = plugins;
			this.handlers = { createFile, onChange, captureError };

			const stateConfig = {
				doc: (contents) ? pubSchema.nodeFromJSON(contents) : undefined,
				schema: pubSchema,
				plugins: plugins,
				...config
			};

			const state = EditorState.create(stateConfig);

			const reactMenu = document.createElement('div');
			const editorView = document.createElement('div');
			editorView.className = 'pub-body';
			// place.appendChild(reactMenu);
			place.appendChild(editorView);

			this.menuElem = reactMenu;

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
				nodeViews: {
					embed: (node, view, getPos) => new EmbedView(node, view, getPos, { block: true }),
					equation: (node, view, getPos) => new LatexView(node, view, getPos, { block: false }),
					block_equation: (node, view, getPos) => new LatexView(node, view, getPos, { block: true }),
					mention: (node, view, getPos) => new MentionView(node, view, getPos, { block: false, suggestComponent }),
					reference: (node, view, getPos, decorations) => new ReferenceView(node, view, getPos, { decorations, block: false }),
					citations: (node, view, getPos) => new CitationsView(node, view, getPos, { block: false }),
					iframe: (node, view, getPos) => new IframeView(node, view, getPos, {}),
					html_block: (node, view, getPos) => new HtmlView(node, view, getPos, {}),
					footnote: (node, view, getPos, decorations) => new FootnoteView(node, view, getPos, { decorations, block: false }),
				},
				...props
			});

			return this.view;

		}



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

	generateFileMap: function() {
		const files = this.props.localFiles || [];
		const fileMap = {};
		for (const file of files) {
			fileMap[file.name] = file.url;
		}

		return fileMap;
	},

	playback: function() {
		this.editor.playbackDoc();
	},

	getTrackedSteps: function() {
		return this.editor.getTrackedSteps();
	},

	rebaseSteps: function(steps) {
		this.editor.rebaseSteps(steps);
	},

	fork: function(forkID) {
		return this.editor.fork(forkID);
	},

	rebase: function(forkID) {
		return this.editor.rebase(forkID);
	},

	rebaseByCommit: function(forkID) {
		return this.editor.rebaseByCommit(forkID);
	},

	getForks: function() {
		return this.editor.getForks();
	},

	commit: function(msg) {
		return this.editor.commit(msg);
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
	}

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
