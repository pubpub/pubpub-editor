import React, { PropTypes } from 'react';

import { PluginKey } from 'prosemirror-state';
import TrackChangesPlugin from './TrackChangesPlugin';
import { collab } from 'prosemirror-collab';

let styles;

const firebaseKey = new PluginKey('firebase');

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
			</div>
		);
	}

});

export default TrackAddon;

styles = {
};
