import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { PluginKey } from 'prosemirror-state';
import { collab } from 'prosemirror-collab';
// import FirebasePlugin from './firebasePlugin';
import FirebasePlugin from './newFirebasePlugin';

const firebaseKey = new PluginKey('firebase');

const propTypes = {
	view: PropTypes.object,
	editorState: PropTypes.object,
	// editorRef: PropTypes.object.isRequired,
	// showCollaborators: React.PropTypes.bool.isRequired,
	onClientChange: PropTypes.func,
};

const defaultProps = {
	view: undefined,
	editorState: undefined,
	onClientChange: ()=>{},
};

class Collaborative extends Component {
	static getPlugins({ firebaseConfig, clientData, editorKey, onClientChange, pluginKey }) {
		// need to add a random client ID number to account for sessions with the same client
		const possible = 'abcdefghijklmnopqrstuvwxyz0123456789';
		let clientHash = '';
		for (let index = 0; index < 6; index++) {
			clientHash += possible.charAt(Math.floor(Math.random() * possible.length));
		}
		const selfClientId = `clientId-${clientData.id}-${clientHash}`;

		return [
			new FirebasePlugin({
				localClientId: selfClientId,
				localClientData: clientData,
				editorKey,
				firebaseConfig,
				pluginKey: pluginKey,
				onClientChange
			}),
			collab({
				clientID: selfClientId
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
		if (!editorState || !transaction) { return null; }
		const firebasePlugin = this.props.pluginKey.get(editorState);
		if (firebasePlugin) {
			return firebasePlugin.sendCollabChanges(transaction, editorState);
		}
		return null;
	}

	getForks() {
		const { editorState } = this.props;

		const firebasePlugin = firebaseKey.get(editorState);
		if (firebasePlugin) {
			return firebasePlugin.props.getForks.bind(firebasePlugin)();
		}
		return Promise.resolve(null);
	}

	fork(forkID) {
		const { editorState } = this.props;

		const firebasePlugin = firebaseKey.get(editorState);
		if (firebasePlugin) {
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

Collaborative.propTypes = propTypes;
Collaborative.defaultProps = defaultProps;
export default Collaborative;
