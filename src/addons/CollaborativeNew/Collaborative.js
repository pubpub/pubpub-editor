import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { collab } from 'prosemirror-collab';
import CollaborativePlugin from './collaborativePlugin';

require('./collaborative.scss');

const propTypes = {
	/* Default props */
	view: PropTypes.object,
	editorState: PropTypes.object,
	pluginKey: PropTypes.object,
	onCollabLoad: PropTypes.func,
	/* Custom props*/
	firebaseConfig: PropTypes.object,
	clientData: PropTypes.object,
	editorKey: PropTypes.string,
	onClientChange: PropTypes.func,
	onStatusChange: PropTypes.func,
};

const defaultProps = {
	view: undefined,
	editorState: undefined,
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
			onClientChange={myClientChangeFunc}
			onStatusChange={myStatusChangeFunc}
			editorKey={'document-num-57'}
		/>
	</Editor>
);
*/
class Collaborative extends Component {
	static pluginName = 'Collaborative';
	static getPlugins({ pluginKey, onCollabLoad, firebaseConfig, clientData, editorKey, onClientChange, onStatusChange }) {
		/* Need to add a random client ID number to account for sessions with the same client */
		const possible = 'abcdefghijklmnopqrstuvwxyz0123456789';
		let clientHash = '';
		for (let index = 0; index < 6; index += 1) {
			clientHash += possible.charAt(Math.floor(Math.random() * possible.length));
		}
		const localClientId = `clientId-${clientData.id}-${clientHash}`;

		return [
			new CollaborativePlugin({
				pluginKey: pluginKey,
				onCollabLoad: onCollabLoad,
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

	constructor(props) {
		super(props);
		this.state = {
			collaborators: []
		};
		this.onChange = this.onChange.bind(this);
		this.getPlugin = this.getPlugin.bind(this);
		this.commit = this.commit.bind(this);
	}

	componentWillReceiveProps(nextProps) {
		if (this.props.editorState !== nextProps.editorState) {
			this.onChange(nextProps);
		}
	}
	componentWillUnmount() {
		this.getPlugin().disconnect();
	}

	onChange(props) {
		if (!props.editorState || !props.transaction) { return null; }
		const plugin = this.getPlugin();
		if (plugin) {
			return plugin.sendCollabChanges(props.transaction, props.editorState);
		}
		return null;
	}

	getPlugin() {
		const { pluginKey, editorState } = this.props;
		return pluginKey.get(editorState);
	}

	commit({ description, uuid, steps, start, end }) {
		console.log('Ya were using this!');
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
