import React, { PropTypes } from 'react';
import { jsonToMarkdown, markdownToJSON } from '../src/markdown';
import { localDiscussions, localFiles, localHighlights, localPages, localPubs, localReferences, localUsers } from './sampledocs/autocompleteLocalData';

// import MarkdownEditor from '../src/editorComponents/MarkdownEditor';
// import RichEditor from '../src/editorComponents/RichEditor';
import FullEditor from '../src/editorComponents/FullEditor';

// requires style attributes that would normally be up to the wrapping library to require
require('@blueprintjs/core/dist/blueprint.css');
// require('../style/base.scss');
// require('../style/markdown.scss');

export const StoryBookFullEditor = React.createClass({

	propTypes: {
		initialContent: PropTypes.string,
		mode: PropTypes.string,
	},

	getInitialState() {
		return {
			mode: (this.props.mode) ? this.props.mode : 'rich',
			initialContent: (this.props.initialContent) ? this.props.initialContent : undefined,
			content: (this.props.initialContent) ? this.props.initialContent : undefined,
		};
	},

	setMarkdown: function() {
		const newMarkdown = this.state.content ? jsonToMarkdown(this.state.content) : '';
		this.setState({
			mode: 'markdown',
			initialContent: newMarkdown,
			content: newMarkdown,
		});
	},

	setRich: function() {
		const newJSON = markdownToJSON(this.state.content || '', localReferences);
		this.setState({
			mode: 'rich',
			initialContent: newJSON,
			content: newJSON,
		});
	},

	onChange: function(newContent) {
		this.setState({ content: newContent });
	},

	onFileUpload: function(file, callback) {
		// Do the uploading - then callback
		callback('giphy.gif');
	},

	onReferenceAdd: function(newCitationObject, callback) {
		// Do the adding/creation to the bibtex file - then callback
		callback(newCitationObject);
	},

	render: function() {
		const editorProps = {
			initialContent: this.state.initialContent,
			onChange: this.onChange,
			handleFileUpload: this.onFileUpload,
			handleReferenceAdd: this.onReferenceAdd,
			localFiles: localFiles,
			localPubs: localPubs,
			localReferences: localReferences,
			localUsers: localUsers,
			localHighlights: localHighlights,
			localDiscussions: localDiscussions,
			localPages: localPages,

			globalCategories: ['pubs', 'users'],
		};
		return (
			<div className={'pt-card pt-elevation-3'} style={{ padding: '0em', margin: '0em auto 2em', maxWidth: '850px' }}>
				<div style={{ backgroundColor: '#ebf1f5', padding: '0.5em', textAlign: 'right', borderBottom: '1px solid rgba(16, 22, 26, 0.15)' }}>
					<div className={'pt-button-group'}>
						<div className={`pt-button${this.state.mode === 'markdown' ? ' pt-active' : ''}`} onClick={this.setMarkdown}>Markdown</div>
						<div className={`pt-button${this.state.mode === 'rich' ? ' pt-active' : ''}`} onClick={this.setRich}>Rich</div>
					</div>
				</div>
				<div style={{ padding: '1em 4em', minHeight: '400px' }}>
					<FullEditor {...editorProps} mode={this.state.mode} />
				</div>

			</div>

		);
	}
});

export default StoryBookFullEditor;
