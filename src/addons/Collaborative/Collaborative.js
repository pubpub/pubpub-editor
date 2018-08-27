/* eslint-disable react/no-unused-prop-types */
import { Component } from 'react';
import PropTypes from 'prop-types';
import { collab } from 'prosemirror-collab';
import CollaborativePlugin from './collaborativePlugin';

require('./collaborative.scss');

const propTypes = {
	/* Default props */
	view: PropTypes.object,
	editorState: PropTypes.object,
	transaction: PropTypes.object,
	pluginKey: PropTypes.object,
	/* Custom props */
	firebaseConfig: PropTypes.object,
	clientData: PropTypes.object,
	editorKey: PropTypes.string,
	onClientChange: PropTypes.func,
	onStatusChange: PropTypes.func,
};

const defaultProps = {
	view: undefined,
	editorState: undefined,
	transaction: undefined,
	pluginKey: undefined,
	firebaseConfig: undefined,
	clientData: undefined,
	editorKey: undefined,
	onClientChange: ()=>{},
	onStatusChange: ()=>{},
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
			editorKey={'document-num-57'}
			onClientChange={myClientChangeFunc}
			onStatusChange={myStatusChangeFunc}
		/>
	</Editor>
);
*/
class Collaborative extends Component {
	static pluginName = 'Collaborative';
	static getPlugins({ pluginKey, firebaseConfig, clientData, editorKey, onClientChange, onStatusChange }) {
		/* Need to add a random hash to clientID to  */
		/* account for sessions with the same client */
		const possible = 'abcdefghijklmnopqrstuvwxyz0123456789';
		let clientHash = '';
		for (let index = 0; index < 6; index += 1) {
			clientHash += possible.charAt(Math.floor(Math.random() * possible.length));
		}
		const localClientId = `clientId-${clientData.id}-${clientHash}`;

		return [
			new CollaborativePlugin({
				pluginKey: pluginKey,
				firebaseConfig: firebaseConfig,
				localClientData: clientData,
				localClientId: localClientId,
				editorKey: editorKey,
				onClientChange: onClientChange,
				onStatusChange: onStatusChange,
			}),
			collab({
				clientID: localClientId
			})
		];
	}

	componentWillReceiveProps(nextProps) {
		const plugin = nextProps.pluginKey.get(nextProps.editorState);
		if (this.props.editorState !== nextProps.editorState
			&& nextProps.editorState
			&& nextProps.transaction
			&& plugin
		) {
			// console.log('About to sendCollabChanges');
			// plugin.sendCollabChanges(nextProps.transaction, nextProps.editorState);
		}
	}
	componentWillUnmount() {
		const plugin = this.props.pluginKey.get(this.props.editorState);
		plugin.disconnect();
	}

	render() {
		return null;
	}
}

Collaborative.propTypes = propTypes;
Collaborative.defaultProps = defaultProps;
export default Collaborative;
