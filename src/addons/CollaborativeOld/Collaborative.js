import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { collab } from 'prosemirror-collab';
import FirebasePlugin from './firebasePlugin';

require('./collaborative.scss');

const propTypes = {
	view: PropTypes.object,
	editorState: PropTypes.object,
	onClientChange: PropTypes.func,
	onForksUpdate: PropTypes.func,
	onStatusChange: PropTypes.func,
	pluginKey: PropTypes.object,
	editorKey: PropTypes.string,
	startStepIndex: PropTypes.number,
};

const defaultProps = {
	view: undefined,
	editorState: undefined,
	onClientChange: ()=>{},
	onForksUpdate: ()=>{},
	onStatusChange: ()=>{},
	pluginKey: undefined,
	editorKey: '',
};

/**
* @module Addons
*/

/**
* @component
*
* Enable collaborative editing using Firebase.
*
* @prop {object} firebaseConfig A Firebase configuration object
* @prop {object} clientData An object containing data about the local user
* @prop {string} editorKey A unique string to identify the given collaborative document instance
* @prop {function} [onClientChange] A function that will be called each time a user connects or disconnects to the collaborative server
* @prop {function} [onStatusChange] A function that will be called each time a user's document status changes. The function will be called with one of the following strings: 'connected', 'saving', 'saved', 'disconnected'
*
* @example
return (
	<Editor>
		<Collaborative
			firebaseConfig={{
				apiKey: 'my-firebase-api-key',
				authDomain: 'my-auth-domain',
				databaseURL: 'my-database-url',
				projectId: 'my-project-id',
				storageBucket: 'my-storage-bucket',
				messagingSenderId: 'my-sender-id',
			}}
			clientData={{
				id: 'unique-user-id',
				name: 'Jane Doe',
				initials: 'JD',
				backgroundColor: 'rgba(0, 0, 250, 0.2)',
				cursorColor: 'rgba(0, 0, 250, 1.0)',
				image: 'https://www.fake.com/my-image.jpg',
			}}
			onClientChange={myClientChangeFunc}
			onStatusChange={myStatusChangeFunc}
			editorKey={'document-num-57'}
		/>
	</Editor>
);
*/
class Collaborative extends Component {
	static pluginName = 'Collaborative';
	static getPlugins({ firebaseConfig, clientData, editorKey, onClientChange, onStatusChange, pluginKey, onForksUpdate, startStepIndex }) {
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
				onStatusChange,
				onForksUpdate,
				startStepIndex
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
		// const firebasePlugin = this.props.pluginKey.get(editorState);
		// if (firebasePlugin) {
		// 	return firebasePlugin.sendCollabChanges(transaction, editorState);
		// }
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
