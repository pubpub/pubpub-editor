import React, { Component } from 'react';
import { PluginKey } from 'prosemirror-state';
import PropTypes from 'prop-types';
import { collab } from 'prosemirror-collab';
import FirebasePlugin from './firebasePlugin';

require('./collaborative.scss');

const firebaseKey = new PluginKey('firebase');

const propTypes = {
	view: PropTypes.object,
	editorState: PropTypes.object,
	onClientChange: PropTypes.func,
	onForksUpdate: PropTypes.func,
};

const defaultProps = {
	view: undefined,
	editorState: undefined,
	onClientChange: ()=>{},
	onForksUpdate: ()=>{},
};

class Collaborative extends Component {
	static getPlugins({ firebaseConfig, clientData, editorKey, onClientChange, pluginKey, onForksUpdate }) {
		// need to add a random client ID number to account for sessions with the same client
		const possible = 'abcdefghijklmnopqrstuvwxyz0123456789';
		let clientHash = '';
		for (let index = 0; index < 6; index++) {
			clientHash += possible.charAt(Math.floor(Math.random() * possible.length));
		}
		const selfClientId = `clientId-${clientData.id}-${clientHash}`;
		// const selfClientId = `clientId-${clientData.id}`;

		return [
			new FirebasePlugin({
				localClientId: selfClientId,
				localClientData: clientData,
				editorKey,
				firebaseConfig,
				pluginKey: pluginKey,
				onClientChange,
				onForksUpdate
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
	componentWillUnmount() {
		this.getPlugin().disconnect();
	}

	onChange = (props) => {
		const { editorState, transaction } = props;
		if (!editorState || !transaction) { return null; }
		const firebasePlugin = this.props.pluginKey.get(editorState);
		if (firebasePlugin) {
			return firebasePlugin.sendCollabChanges(transaction, editorState);
		}
		return null;
	}

	getPlugin() {
		const { pluginKey, editorState } = this.props;
		return pluginKey.get(editorState);
	}

	getForks = () => {
		return this.getPlugin().getForks();
	}

	fork = () => {
		return this.getPlugin().fork();
	}

	commit = ({ description, uuid, steps, start, end }) => {
		return this.getPlugin().commit({ description, uuid, steps, start, end });
	}

	render() {
		if (!this.props.view) { return null; }
		return <div id={`cursor-container-${this.props.editorKey}`} className={'cursor-container'} />;
	}
}

Collaborative.propTypes = propTypes;
Collaborative.defaultProps = defaultProps;
export default Collaborative;
