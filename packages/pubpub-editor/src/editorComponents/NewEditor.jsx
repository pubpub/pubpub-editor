import React, { PropTypes } from 'react';

import Autocomplete from '../Autocomplete/Autocomplete';
import { FirebaseEditor } from '../prosemirror-setup/editors/firebaseEditor';
import FormattingMenu from '../FormattingMenu/FormattingMenu';
import InsertMenu from '../InsertMenu/InsertMenu';
import { RichEditor as ProseEditor } from '../prosemirror-setup';
import TableMenu from '../TableMenu/TableMenu';
// import ReactDOM from 'react-dom';
import { createRichMention } from '../Autocomplete/autocompleteConfig';
import { migrateMarks } from '../migrate/migrateDiffs';

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

		localUsers: PropTypes.array,
		localPubs: PropTypes.array,
		localFiles: PropTypes.array,
		localReferences: PropTypes.array,
		localHighlights: PropTypes.array,
		localPages: PropTypes.array,
		globalCategories: PropTypes.array,
	},

	getInitialState() {
		return {
			visible: undefined,
			top: 0,
			left: 0,
			input: '',
			menuTop: 7,
			inlineCenter: 0,
			inlineTop: 0,
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
		// Should be called on every document change (delete, addition, etc)
		// is toJSON expensive?
		this.props.onChange(this.editor.view.state.doc.toJSON());
		if (this.insertMenu) { this.insertMenu.updatePosition(this.editor.view); }
		if (this.tableMenu) { this.tableMenu.updatePosition(this.editor.view); }

		this.updateCoordsForMenus();
	},

	onCursorChange() {
		// Should be called on every cursor update
		if (this.insertMenu) { this.insertMenu.updatePosition(this.editor.view); }
		if (this.tableMenu) { this.tableMenu.updatePosition(this.editor.view); }
		this.updateCoordsForMenus();
	},

	updateCoordsForMenus: function() {
		const currentPos = this.editor.view.state.selection.$to.pos;

		const currentNode = this.editor.view.state.doc.nodeAt(currentPos - 1);
		const isRoot = this.editor.view.state.selection.$to.depth === 2;

		const container = document.getElementById('rich-editor-container');

		if (!this.editor.view.state.selection.$cursor && currentNode && currentNode.text) {
			const currentFromPos = this.editor.view.state.selection.$from.pos;
			const currentToPos = this.editor.view.state.selection.$to.pos;
			const left = this.editor.view.coordsAtPos(currentFromPos).left - container.getBoundingClientRect().left;
			const right = this.editor.view.coordsAtPos(currentToPos).right - container.getBoundingClientRect().left;
			const inlineCenter = left + ((right - left) / 2);
			const inlineTop = this.editor.view.coordsAtPos(currentFromPos).top - container.getBoundingClientRect().top;
			return this.setState({
				inlineCenter: inlineCenter,
				inlineTop: inlineTop,
			});
		}

		return this.setState({
			inlineTop: 0,
			inlineCenter: 0,
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
				<Autocomplete
					top={this.state.top}
					left={this.state.left}
					visible={this.state.visible}
					input={this.state.input}
					onSelection={this.onMentionSelection}
					localUsers={this.props.localUsers}
					localPubs={this.props.localPubs}
					localFiles={this.props.localFiles}
					localReferences={this.props.localReferences}
					localHighlights={this.props.localHighlights}
					localPages={this.props.localPages}
					globalCategories={this.props.globalCategories} />

					<InsertMenu
						ref={(input) => { this.insertMenu = input; }}
						editor={this.editor}
						allReferences={this.props.localReferences}
						handleFileUpload={this.props.handleFileUpload}
						handleReferenceAdd={this.props.handleReferenceAdd} />

					<TableMenu
						ref={(input) => { this.tableMenu = input; }}
						editor={this.editor} />

				{this.editor &&
					<FormattingMenu
						editor={this.editor}
						top={this.state.inlineTop}
						left={this.state.inlineCenter} />
				}

				<div className="pubEditor" id="pubEditor" />
			</div>
		);
	}

});

export default RichEditor;
