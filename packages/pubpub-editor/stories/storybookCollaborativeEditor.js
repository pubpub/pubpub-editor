import { Button, Menu, MenuItem, Popover, PopoverInteractionKind, Position } from '@blueprintjs/core';
import React, { PropTypes } from 'react';
import { jsonToMarkdown, markdownToJSON } from '../src/markdown';
import { localDiscussions, localFiles, localHighlights, localPages, localPubs, localReferences, localUsers } from './sampledocs/autocompleteLocalData';

import ExportButton from '../src/ExportMenu/ExportButton';
import FirebaseConfig from './firebase/firebaseConfig';
// import MarkdownEditor from '../src/editorComponents/MarkdownEditor';
// import RichEditor from '../src/editorComponents/RichEditor';
import FullEditor from '../src/editorComponents/RichEditor';
import RenderDocument from '../src/RenderDocument/RenderDocument';
import { csltoBibtex } from '../src/references/csltobibtex';
import { markdownToExport } from '../src/ExportMenu';
import request from 'superagent';
import resetFirebase from './firebase/reset';
import { s3Upload } from './utils/uploadFile';

// requires style attributes that would normally be up to the wrapping library to require
require('@blueprintjs/core/dist/blueprint.css');
require('./utils/pubBody.scss');
// require('../style/base.scss');
// require('../style/markdown.scss');

const CommitMsg = ({commit, onCommitHighlight, clearCommitHighlight}) => {
	const onEnter = () => {
		onCommitHighlight(commit.commitID);
		return;
		console.log('turning on', commit.commitID);

		const commitsToHighlight = document.querySelectorAll(`[data-commit="${commit.commitID}"]`);
		if (commitsToHighlight) {
			for (const commitHighlight of commitsToHighlight) {
				console.log(commitHighlight);
				if (commitHighlight.classList.contains("commitHover")) {
					console.log('got a contains!!');
				}
				// commitHighlight.setAttribute("data-highlight", true);
				//commitHighlight.classList.add("commitHover");
			}
		}
	};
	const onLeave = () => {
		clearCommitHighlight();
		return;
		console.log('turning off', commit.commitID);
		const commitsToHighlight = document.querySelectorAll(`[data-commit="${commit.commitID}"]`);
		if (commitsToHighlight) {
			for (const commitHighlight of commitsToHighlight) {
				commitHighlight.classList.remove("commitHover");
			}
		}
	};
	return (
		<div onMouseEnter={onEnter} onMouseLeave={onLeave}
			style={{width: '100%', height: '30px', marginBottom: 10, padding: '5px 10px', display: 'block', backgroundColor: '#eee', cursor: 'pointer'}} >
			{commit.description}
		</div>);
}


const CommitRebase = ({commit, acceptCommit}) => {
	/*
	const onEnter = () => {
		const query = document.querySelector(`[data-commit="${commit.commitID}"]`);
		if (query) {
			query.classList.add("commitHover");
		}
	};
	const onLeave = () => {
		const query = document.querySelector(`[data-commit="${commit.commitID}"]`);
		if (query) {
		 query.classList.remove("commitHover");
		}
	};
	*/
	return (
		<div
			style={{width: '100%', height: 'auto', marginBottom: 10, padding: '5px 10px', display: 'block', backgroundColor: '#eee', cursor: 'pointer'}} >
			{commit.description}
			<div style={{marginTop: 6}}><Button minimal onClick={acceptCommit} iconName="fork" text="Accept" /></div>
		</div>);
}



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
      editorKey: this.props.editorKey,
      forks: [],
      inFork: false,
			forkParent: null,
			commits: [],
			highlightCommitID: null,
		}
	},

	onChange: function(newContent) {
		this.setState({ content: newContent });
	},

  componentDidMount: function() {
		if (this.props.allowForking) {
			this.getForks();
		}
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
    this.editor.fork('testfork'+Math.round(Math.random()*1000)).then((forkName) => {
      this.getForks();
    });
  },

  rebase: function(forkID) {
    this.editor.rebase(forkID).then(() => {
      console.log('finished rebase!');
    });
  },


  rebaseByCommit: function(forkID) {
    this.editor.rebaseByCommit(forkID).then(({ rebaseCommitHandler, commits }) => {
			this.setState({ rebaseCommits: commits, rebaseCommitHandler, rebasingDoc: forkID });
    });
  },

	joinParent: function(name) {
    this.setState({ editorKey: name, inFork: false, forkParent: null });
  },

  joinFork: function(name) {
    this.setState({ editorKey: name, inFork: true, forkParent: this.state.editorKey });
  },

  getForks: function() {
    this.editor.getForks().then((forks) => {
      if (forks) {
        this.setState({ forks });
      }
    });
  },

	commit: function() {
		const commitMsg = this.commitArea.value;
		this.editor.commit(commitMsg).then(() => {
			console.log('finished commit!');
		});
	},

	updateCommits: function(commits) {
		this.setState({ commits: commits || [] });
	},

	onCommitHighlight: function(commitID) {
		this.setState({ highlightCommitID: commitID });
	},

	clearCommitHighlight: function(commitID) {
		this.setState({ highlightCommitID: null });
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
      editorKey: this.state.editorKey,
      trackChanges: this.props.trackChanges || this.state.inFork,
			firebaseConfig: FirebaseConfig,
			updateCommits: this.updateCommits,
		};

		const { rebaseCommits, rebaseCommitHandler, rebasingDoc, highlightCommitID } = this.state;

		return (
			<div className={'pt-card pt-elevation-3'} style={{ padding: '0em', margin: '0em auto 2em', maxWidth: '950px' }}>
				<div style={{ backgroundColor: '#ebf1f5', padding: '0.5em', textAlign: 'right', borderBottom: '1px solid rgba(16, 22, 26, 0.15)' }}>

					<div className={`pt-button`} onClick={resetFirebase}>Reset Database</div>

				</div>

				<style>

					{highlightCommitID && `
						[data-commit="${highlightCommitID}"] {
							background-color: red !important;
						}
					`}
				</style>

				<div style={{display: 'flex', flexDirection: 'row'}}>
          <div style={{width: 200, padding: 10}}>

						{(!this.state.inFork) ?

							<div>
								{(this.props.allowForking) ?
									<h4>Forks
										<Button minimal onClick={this.fork} iconName="fork" text="New Fork " />
									</h4>
								: null }


		            {this.state.forks.map((fork) => {
		              return (
										<div>
											<Button className="pt-minimal" minimal onClick={this.joinFork.bind(this, fork.name)} iconName="document" text={fork.name} />

											{(!fork.merged) ?
												<span>
													<Button className="pt-minimal" minimal onClick={this.rebase.bind(this, fork.name)} iconName="git-pull" />
													<Button className="pt-minimal" minimal onClick={this.rebaseByCommit.bind(this, fork.name)} iconName="git-merge" />
												</span>
											:
												<Button disabled className="pt-minimal" minimal  iconName="git-commit" />
											}
											{(fork.name === rebasingDoc)
												?
												(rebaseCommits.map((commit, index)=> {
													const acceptCommit = () => {
														return rebaseCommitHandler(index);
													}
													return (<CommitRebase commit={commit} acceptCommit={acceptCommit}/>);
												}))
												: null
											}
										</div>);
		            })}
							</div>

						: (
							<div>
								<Button onClick={this.joinParent.bind(this, this.state.forkParent)} iconName="circle-arrow-left" text={this.state.forkParent} />

								<textarea ref={(textarea) => { this.commitArea = textarea; }}  className="pt-input" dir="auto"></textarea>
								<Button onClick={this.commit} text="Commit" />

								{this.state.commits.map((commit) => {
									return (<CommitMsg onCommitHighlight={this.onCommitHighlight} clearCommitHighlight={this.clearCommitHighlight} commit={commit}/>);
								})}

							</div>
							)
	        }
        </div>

				<div className={(!this.state.inFork) ? 'main-body' : 'fork-body'} style={{ padding: '1em 4em', minHeight: '400px' }}>
          <FullEditor ref={(editor) => { this.editor = editor; }} {...editorProps} mode="rich" />
				</div>
			</div>


			</div>

		);
	}
});

export default StoryBookCollaborativeEditor;
