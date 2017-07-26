import { Menu, MenuItem, Popover, PopoverInteractionKind, Position } from '@blueprintjs/core';
import React, { PropTypes } from 'react';
import { jsonToMarkdown, markdownToJSON } from '../src/markdown';
import { localDiscussions, localFiles, localHighlights, localPages, localPubs, localReferences, localUsers } from './sampledocs/autocompleteLocalData';

import ExportButton from '../src/ExportMenu/ExportButton';
// import MarkdownEditor from '../src/editorComponents/MarkdownEditor';
// import RichEditor from '../src/editorComponents/RichEditor';
import FullEditor from '../src/editorComponents/RichEditor';
import RenderDocument from '../src/RenderDocument/RenderDocument';
import { csltoBibtex } from '../src/references/csltobibtex';
import { markdownToExport } from '../src/ExportMenu';
import request from 'superagent';
import { s3Upload } from './utils/uploadFile';

// requires style attributes that would normally be up to the wrapping library to require
require('@blueprintjs/core/dist/blueprint.css');
require('./utils/pubBody.scss');
// require('../style/base.scss');
// require('../style/markdown.scss');

export const StoryBookCollaborativeEditor = React.createClass({

	propTypes: {
		initialContent: PropTypes.string,
		mode: PropTypes.string,
	},

	getInitialState() {
		return {
			mode: (this.props.mode) ? this.props.mode : 'rich',
			initialContent: (this.props.initialContent) ? this.props.initialContent : undefined,
			content: (this.props.initialContent) ? this.props.initialContent : undefined,
			exportLoading: undefined,
			exportError: undefined,
			exportUrl: undefined,
			pdftexTemplates: {},
		}
	},

	onChange: function(newContent) {
		this.setState({ content: newContent });
	},

  componentDidMount: function() {
    this.getForks();
  },


	handleFileUpload: function(file, callback) {
		// Do the uploading - then callback
		const onFinish = (evt, index, type, filename, title, url) => {
			callback(title, url);
		};
		s3Upload(file, null, onFinish, 0);
	},

	handleReferenceAdd: function(newCitationObject, callback) {
		const bibtexString = csltoBibtex([newCitationObject]);
		localReferences.push(newCitationObject);
		// Do the adding/creation to the bibtex file - then callback
		if (callback) {
			callback(newCitationObject);
		}
	},

  fork: function() {
    this.editor.fork('testfork'+Math.round(Math.random()*1000));
  },

  getForks: function() {
    this.editor.getForks().then((forks) => {
      console.log('got forks!', forks);      
    });
  },

	render: function() {
		const editorProps = {
			initialContent: this.state.initialContent,
			onChange: this.onChange,
			handleFileUpload: this.handleFileUpload,
			handleReferenceAdd: this.handleReferenceAdd,
			localFiles: localFiles,
			localPubs: localPubs,
			localReferences: localReferences,
			localUsers: localUsers,
			localHighlights: localHighlights,
			localDiscussions: localDiscussions,
			localPages: localPages,
			globalCategories: ['pubs', 'users'],
			collaborative: this.props.collaborative,
      editorKey: this.props.editorKey,
		};
		const pdftexTemplates = this.state.pdftexTemplates;
		const popoverContent = (
			<div>
				<h5>Popover title</h5>
				{ Object.keys(pdftexTemplates).map((key) => {

						return (
							<div>
							<div className={`pt-button pt-popover-dismiss`} onClick={this.setExport.bind(this, key)}>{pdftexTemplates[key].displayName}</div>
							<br/>
						</div>
						);
					})
				}

			</div>
		);
		return (
			<div className={'pt-card pt-elevation-3'} style={{ padding: '0em', margin: '0em auto 2em', maxWidth: '850px' }}>
				<div style={{ backgroundColor: '#ebf1f5', padding: '0.5em', textAlign: 'right', borderBottom: '1px solid rgba(16, 22, 26, 0.15)' }}>
					<div className={'pt-button-group'}>
            <div className={`pt-button${this.state.mode === 'markdown' ? ' pt-active' : ''}`} onClick={this.fork}>Fork</div>
					</div>
				</div>
				<div style={{ padding: '1em 4em', minHeight: '400px' }}>
          <FullEditor ref={(editor) => { this.editor = editor; }} {...editorProps} mode="rich" />
				</div>


			</div>

		);
	}
});

export default StoryBookCollaborativeEditor;
