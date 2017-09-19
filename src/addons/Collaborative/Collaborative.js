import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { PluginKey } from 'prosemirror-state';
import { collab } from 'prosemirror-collab';
import FirebasePlugin from './firebasePlugin';

const firebaseKey = new PluginKey('firebase');

const propTypes = {
	view: PropTypes.object.isRequired,
	editorState: PropTypes.object.isRequired,
	// editorRef: PropTypes.object.isRequired,
	// showCollaborators: React.PropTypes.bool.isRequired,
};

class CollaborativeAddon extends Component {
	static getPlugins({ firebaseConfig, clientID, editorKey }) {
		// need to add a random client ID number to account for sessions with the same client
		const selfClientID = clientID + Math.round(Math.random() * 10000);
		return [
			FirebasePlugin({
				selfClientID: selfClientID,
				editorKey,
				firebaseConfig,
				pluginKey: firebaseKey
			}),
			collab({
				clientID: selfClientID
			})
		];
	}

	constructor(props) {
		super(props);
		this.state = {
			collaborators: []
		};
	}

	componentWillReceiveProps(nextProps) {
		if (this.props.editorState !== nextProps.editorState) {
			this.onChange(nextProps);
		}
	}
	onChange(props) {
		const { editorState, transaction } = props;
		if (!editorState || !transaction) {
			return;
		}
		const firebasePlugin = firebaseKey.get(editorState);
		if (firebasePlugin) {
			if (!transaction.getMeta('rebase')) {
				return firebasePlugin.props.updateCollab(transaction, editorState);
			}
		}
	}

	getForks() {
		const { editorState } = this.props;

		let firebasePlugin;
		if (firebasePlugin = firebaseKey.get(editorState)) {
			return firebasePlugin.props.getForks.bind(firebasePlugin)();
		}
		return Promise.resolve(null);
	}

	fork(forkID) {
		const { editorState } = this.props;

		let firebasePlugin;
		if (firebasePlugin = firebaseKey.get(editorState)) {
			return firebasePlugin.props.fork.bind(firebasePlugin)(forkID);
		}
		return Promise.resolve(null);
	}

	render() {
		// const { top, left } = this.state;
		const { view } = this.props;

		if (!view) {
			return null;
		}

		return <div />;
	}
}

CollaborativeAddon.propTypes = propTypes;
export default CollaborativeAddon;
