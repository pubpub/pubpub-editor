import { Autocomplete, CollaborativeAddon, FormattingMenu, InsertMenu, TableMenu } from '../src/addons';
import { Button, Menu, MenuItem, Popover, PopoverInteractionKind, Position } from '@blueprintjs/core';
import React, { PropTypes } from 'react';
import { localDiscussions, localFiles, localHighlights, localPages, localPubs, localReferences, localUsers } from './sampledocs/autocompleteLocalData';

// import MarkdownEditor from '../src/editorComponents/MarkdownEditor';
// import RichEditor from '../src/editorComponents/RichEditor';
import FullEditor from '../src/editor/Editor';
import RenderDocumentRebase from '../src/schema/render/RenderDocumentRebase';
import { csltoBibtex } from '../src/utils/references/csltobibtex';
import { firebaseConfig } from './config/secrets';
import resetFirebase from './firebase/reset';
import { s3Upload } from './utils/uploadFile';
import update from 'react-addons-update';

// requires style attributes that would normally be up to the wrapping library to require
require('@blueprintjs/core/dist/blueprint.css');
require('./utils/pubBody.scss');
require('../style/fonts.scss');

// require('../style/base.scss');
// require('../style/markdown.scss');

const CommitMsg = ({ commit, onCommitHighlight, clearCommitHighlight }) => {
	const onEnter = () => {
		onCommitHighlight(commit.uuid);
	};
	const onLeave = () => {
		clearCommitHighlight();
	};
	return (
		<div onMouseEnter={onEnter} onMouseLeave={onLeave}
			style={{width: '100%', height: '30px', marginBottom: 10, padding: '5px 10px', display: 'block', backgroundColor: '#eee', cursor: 'pointer'}} >
			{commit.description}
		</div>);
}


const CommitRebase = ({ commit, acceptCommit,  onCommitHighlight, clearCommitHighlight }) => {
	const onEnter = () => {
		onCommitHighlight(commit.uuid);
	};
	const onLeave = () => {
		clearCommitHighlight();
	};
	return (
		<div onMouseEnter={onEnter} onMouseLeave={onLeave}
			style={{width: '100%', height: 'auto', marginBottom: 10, padding: '5px 10px', display: 'block', backgroundColor: '#eee', cursor: 'pointer'}} >
			{commit.description}
			{(!commit.merged) ?
				<div style={{marginTop: 6}}><Button minimal onClick={acceptCommit} iconName="fork" text="Accept" /></div>
			:
				<div style={{marginTop: 6}}>MERGED</div>
			}
		</div>);
}

const CommitHighlightRebase = ({ commit, acceptCommit }) => {
	const onEnter = () => {
		onCommitHighlight(commit.uuid);
	};
	const onLeave = () => {
		clearCommitHighlight();
	};
	return (
		<div onMouseEnter={onEnter} onMouseLeave={onLeave}
			style={{width: '150px', height: 'auto', marginBottom: 10, padding: '5px 10px', display: 'block', backgroundColor: '#eee', cursor: 'pointer'}} >
			{commit.description}
			{(!commit.merged) ?
				<div style={{marginTop: 6}}><Button minimal onClick={acceptCommit} iconName="fork" text="Accept" /></div>
			:
				<div style={{marginTop: 6}}>MERGED</div>
			}
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

	componentWillUpdate: function() {
		if (this.collab && (!this.state.forks || this.state.forks.length === 0) && this.state.editorState) {
			this.getForks();
		}
	},

	onChange: function(newContent) {
		this.setState({ content: newContent });
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
    this.collab.fork(this.props.editorKey+Math.round(Math.random()*1000)).then((forkName) => {
      this.getForks();
    });
  },

	getForks: function() {
		this.collab.getForks().then((forks) => {
			if (forks) {
				this.setState({ forks });
			}
		});
	},

  rebase: function(forkID) {
    this.editor.rebase(forkID).then(() => {
      console.log('finished rebase!');
    });
  },


	// get final doc
  rebaseByCommit: function(forkID) {
    this.editor.rebaseByCommit(forkID).then(({ rebaseCommitHandler, commits, checkpointDoc }) => {
			this.setState({ rebaseCommits: commits, rebaseCommitHandler, rebasingDoc: forkID, comparisonDoc: checkpointDoc });
    });
  },

	joinParent: function(name) {
    this.setState({ editorKey: name, inFork: false, forkParent: null });
  },

  joinFork: function(name) {
    this.setState({ editorKey: name, inFork: true, forkParent: this.state.editorKey });
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

	clickDoc: function(evt) {
		const target = evt.target;
		let parent = target;
		let commitUUID = null;
		while ((parent = parent.parentNode)) {
			if (parent && parent.getAttribute('data-commit')) {
				commitUUID = parent.getAttribute('data-commit');
				break;
			}
		}

		const boundingRect = this.rebaseContainer.getBoundingClientRect();

		if (commitUUID) {
			this.setState({ commitUUID, commitX: evt.clientX - boundingRect.left, commitY: evt.clientY - boundingRect.top });
		}
	},

	acceptCommit: function(index) {

		return this.state.rebaseCommitHandler(index).then(() => {
			const { rebaseCommits } = this.state;
			const updateObj = {};

			updateObj[index] = { merged: {$set: true} };
			const newRebaseCommits = update(rebaseCommits, updateObj);
			this.setState({rebaseCommits: newRebaseCommits});
		});

	},

	render: function() {
		const editorProps = {
			initialContent: this.state.initialContent,
			onChange: this.onChange,
      trackChanges: this.props.trackChanges || this.state.inFork,
			updateCommits: this.updateCommits,
		};

		const { rebaseCommits, rebaseCommitHandler, rebasingDoc, comparisonDoc, highlightCommitID } = this.state;

		return (
			<div className={'pt-card pt-elevation-3'} style={{ padding: '0em', margin: '0em auto 2em', maxWidth: '950px' }}>
				<div style={{ backgroundColor: '#ebf1f5', padding: '0.5em', textAlign: 'right', borderBottom: '1px solid rgba(16, 22, 26, 0.15)' }}>

					<div className={`pt-button`} onClick={resetFirebase}>Reset Database</div>

				</div>

				<style>
					{highlightCommitID !== null && `
						[data-commit="${highlightCommitID}"] {
							background-color: red !important;
						}
					`}
				</style>

				<div style={{display: 'flex', flexDirection: 'column'}}>
          <div style={{height: 75, padding: 10}}>

						{(!this.state.inFork) ?

							<div style={{display: 'flex', flexDirection: 'row'}}>
								{(this.props.allowForking) ?
									<h4>Forks
										<div>
										<Button className="pt-small" small minimal onClick={this.fork} iconName="fork" text="New Fork " />
									</div>
									</h4>
								: null }

		            {this.state.forks.map((fork) => {
		              return (
										<div>
											<Button className="pt-minimal" minimal onClick={this.joinFork.bind(this, fork.name)} iconName="document" text={fork.name} />
											{(!fork.merged) ?
												<span>
													<Button className="pt-minimal" minimal onClick={this.rebaseByCommit.bind(this, fork.name)} iconName="git-merge" />
												</span>
											:
												<Button disabled className="pt-minimal" minimal  iconName="git-commit" />
											}
										</div>);
		            })}
							</div>
						: null
	        }
        </div>

				<div style={{display: 'flex', flexDirection: 'row'}}>
					{(this.state.inFork) ?
						<div>
							<Button onClick={this.joinParent.bind(this, this.state.forkParent)} iconName="circle-arrow-left" text={this.state.forkParent} />

							{this.state.commits.map((commit) => {
								return (<CommitMsg onCommitHighlight={this.onCommitHighlight} clearCommitHighlight={this.clearCommitHighlight} commit={commit}/>);
							})}

						</div>
						: null
					}

					<div className={(!this.state.inFork) ? 'main-body' : 'fork-body'} style={{ padding: '1em 4em', minHeight: '400px', minWidth: '400px' }}>

	          <FullEditor ref={(editor) => { this.editor = editor; }} {...editorProps} mode="rich">
							<Autocomplete
								onSelection={this.onMentionSelection}
								localUsers={this.props.localUsers}
								localPubs={this.props.localPubs}
								localFiles={this.props.localFiles}
								localReferences={this.props.localReferences}
								localHighlights={this.props.localHighlights}
								localPages={this.props.localPages}
								globalCategories={['pubs', 'users']} />
							<InsertMenu
								allReferences={this.props.localReferences}
								handleFileUpload={this.handleFileUpload}
								handleReferenceAdd={this.handleReferenceAdd} />
							<TableMenu />
							<FormattingMenu />
							{/*What happens if a collaborative= plugin is removed?*/}
							<CollaborativeAddon
								ref={(collab) => {this.collab = collab;}}
								firebaseConfig={firebaseConfig}
								clientID={this.props.clientID}
								editorKey={this.props.editorKey}
							/>

						</FullEditor>
					</div>

					{(comparisonDoc) ?
						<RenderDocumentRebase doc={comparisonDoc} commits={rebaseCommits} acceptCommit={this.acceptCommit} />
					: null }
				</div>

			</div>


			</div>

		);
	}
});

export default StoryBookCollaborativeEditor;
