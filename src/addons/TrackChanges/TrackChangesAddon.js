import { Button, Menu, MenuItem, Popover, PopoverInteractionKind, Position } from '@blueprintjs/core';
import React, { PropTypes } from 'react';

import { PluginKey } from 'prosemirror-state';
import TrackChangesPlugin from './TrackChangesPlugin';

let styles;

const trackKey = new PluginKey('track');
// how to track firebase changes well?
// how to use other keys in the export?
// store plugin keys with others?
// create a track plugin

export const TrackAddon = React.createClass({
	propTypes: {
		containerId: React.PropTypes.string.isRequired,
		view: React.PropTypes.object.isRequired,
		editorState: React.PropTypes.object.isRequired,
		editorRef: React.PropTypes.object.isRequired,
		showCollaborators: React.PropTypes.bool.isRequired,
	},
	statics: {
		getPlugins({  }) {
			return [ TrackChangesPlugin ];
		},
	},
	getInitialState: function() {
		return { collaborators: [] };
	},
	componentWillReceiveProps(nextProps) {
		if (this.props.editorState !== nextProps.editorState) {
			this.onChange(nextProps);
		}
	},
	onChange(props) {
		const { editorState, transaction } = props;
		if (!editorState || !transaction) {
			return;
		}
		const firebasePlugin = firebaseKey.get(editorState);
		if (firebasePlugin) {
			if (!transaction.getMeta("rebase") ) {
				return firebasePlugin.props.updateCollab(transaction, editorState);
			}
		}
	},

	fork(forkID) {
		const { editorState } = this.props;

		let firebasePlugin;
		if (firebasePlugin = firebaseKey.get(editorState)) {
			return firebasePlugin.props.fork.bind(firebasePlugin)(forkID);
		}
		return Promise.resolve(null);
	},

	getForks() {
		const { editorState } = this.props;

		let firebasePlugin;
		if (firebasePlugin = firebaseKey.get(editorState)) {
			return firebasePlugin.props.getForks.bind(firebasePlugin)();
		}
		return Promise.resolve(null);
	},

	render: function() {
		const { top, left } = this.state;
		const { view } = this.props;

		if (!top || !editor || !view ) {
			return null;
		}

		return (
			<div>
				<div>
					<Button onClick={this.joinParent.bind(this, this.state.forkParent)} iconName="circle-arrow-left" text={"hey this is a commit"} />

					{this.state.commits.map((commit) => {
						return (<CommitMsg onCommitHighlight={this.onCommitHighlight} clearCommitHighlight={this.clearCommitHighlight} commit={commit}/>);
					})}

				</div>
			</div>
		);
	}

});

export default TrackAddon;

styles = {
};
