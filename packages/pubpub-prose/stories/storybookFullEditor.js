import React from 'react';
import RichEditor from '../src/editorComponents/RichEditor';
import MarkdownEditor from '../src/editorComponents/MarkdownEditor';
import { markdownToJSON, jsonToMarkdown } from '../src/markdown';
import { localFiles, localPubs, localReferences, localUsers, localHighlights, localDiscussions } from './sampledocs/autocompleteLocalData';

// requires style attributes that would normally be up to the wrapping library to require
require('@blueprintjs/core/dist/blueprint.css');
require('../style/base.scss');
require('../style/markdown.scss');

export const StoryBookFullEditor = React.createClass({
	getInitialState() {
		return {
			mode: 'rich',
			initialContent: undefined,
			content: undefined,
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
		const newJSON = markdownToJSON(this.state.content || '');
		this.setState({ 
			mode: 'rich',
			initialContent: newJSON,
			content: newJSON,
		});	
	},

	onChange: function(newContent) {
		this.setState({ content: newContent });
	},

	render: function() {
		const editorProps = {
			initialContent: this.state.initialContent,
			onChange: this.onChange,
			
			localFiles: localFiles,
			localPubs: localPubs,
			localReferences: localReferences,
			localUsers: localUsers,
			localHighlights: localHighlights,
			localDiscussions: localDiscussions,

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
				<div style={{ padding: '1em 2em' }}>
					{this.state.mode === 'markdown' &&
						<MarkdownEditor {...editorProps} />
					}
					{this.state.mode === 'rich' &&
						<RichEditor {...editorProps} />
					}
				</div>

			</div>

		);
	}
});

export default StoryBookFullEditor;
