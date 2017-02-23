import { CitationsPlugin, RelativeFilesPlugin, SelectPlugin } from '../plugins';
import {migrateDiffs, migrateMarks, schema} from '../setup';

import {BaseEditor} from './baseEditor';
import {MD5} from 'object-hash';

class CollaborativeEditor extends BaseEditor {

  constructor({ place, contents, text, fileMap,
    collab: { userID, token, username, docID, repoID, serverURL },
    handlers: { createFile },

  }) {

    super();

    const tokenInfo = {
      username: username,
      docid: docID,
      token: token,
      repoID: repoID,
    };

    const clientID = `${userID}-${Math.round(Math.random() * 1000)}`;
    this.clientID = clientID;
    // console.log('with client ID', clientID);

		const {ModServerCommunications} = require('../collab/server-communications');
		const {ModCollab} = require('../collab/mod');

		const tokenValid = true;

		const that = this;

		const collab = {};
		collab.docInfo = {
			rights: '',
			last_diffs: [],
			is_owner: false,
			is_new: false,
			titleChanged: false,
			changed: false,
		};
		collab.mod = {};
		collab.waitingForDocument = true;
		collab.schema = schema;
		collab.receiveDocument = this.receiveDocument;
		collab.receiveDocumentValues = this.receiveDocumentValues;
		collab.askForDocument = this.askForDocument;
		collab.getHash = this.getHash;
		collab.updateParticipants = this.updateParticipants;
		collab.applyAction = this.applyAction;
		collab.getId = this.getId;

		collab.getState = () => {
			return this.view.state;
		};

		collab.setConnectionStatus = this.setConnectionStatus;

		collab.setParticipants = function(participants) {
			// that.setState({participants: participants});
		};

		// Collaboration Authentication information
		collab.doc_id = tokenInfo.docid;
    collab.repoID = tokenInfo.repoID;
		collab.username = tokenInfo.username;
		collab.token = tokenInfo.token;
		collab.img = 'google.com';
		collab.doc = {id: tokenInfo.docid };
		this.collab = collab;

		new ModServerCommunications(collab, serverURL);
		new ModCollab(collab);

		// this.setSaveTimers();

    const {pubpubSetup} = require('../setup');
    const {markdownParser} = require("../markdown");
    const collabEditing = require('prosemirror-collab').collab;

    const plugins = pubpubSetup({ schema })
    .concat(CitationsPlugin)
    .concat(SelectPlugin)
    .concat(RelativeFilesPlugin)
    .concat(collabEditing({version: 0, clientID: clientID}));


    //.concat(RelativeFilesPlugin)

    let docJSON;
    if (text) {
      docJSON = markdownParser.parse(text).toJSON();
    } else {
      docJSON = contents;
    }
    this.place = place;
    this.createFile = createFile;
    this.plugins = plugins;
    this.fileMap = fileMap;
    this.collab.mod.serverCommunications.init();

    this.remove = this.remove.bind(this);
  }

  remove() {
    super.remove();
    this.collab.mod.serverCommunications.close();
  }

  loadDocument = () => {

    this.collab.waitingForDocument = false;
    migrateMarks(this.collab.doc.contents);

    const docJSON = this.collab.doc.contents;
    if (docJSON.content && docJSON.content[docJSON.content.length - 1].type !== "citations" ) {
      const citationsObj =   { "content": [], "type": "citations" };
      docJSON.content.push(citationsObj);
    }

    this.create({place: this.place, contents: docJSON, config: {fileMap: this.fileMap}, plugins: this.plugins, handlers: { createFile: this.createFile } });
    // console.log(docJSON);

    migrateDiffs(this.collab.docInfo.last_diffs);
    // console.log('Got diffs!', this.collab.docInfo.last_diffs);
    const appliedAction = this.collab.mod.collab.docChanges.applyAllDiffs(this.collab.docInfo.last_diffs);
    if (appliedAction) {
    		// this.applyAction(appliedAction);
    } else {
    		// indicates that the DOM is broken and cannot be repaired
    		this.collab.mod.serverCommunications.disconnect();
    }

  }

  getState = () => {
    return this.view.state;
  }

  getId = () => {
    return this.clientID;
  }


	askForDocument = () => {
		if (this.collab.waitingForDocument) {
			return;
		}
		this.collab.waitingForDocument = true;
		this.collab.mod.serverCommunications.send({
			type: 'get_document'
		});
	}

	receiveDocument = (data) => {
		// const that = this;
		this.collab.receiveDocumentValues(data.document, data.document_values);
		this.loadDocument();
		if (data.hasOwnProperty('user')) {
			this.collab.user = data.user;
		}

		this.collab.mod.serverCommunications.send({
			type: 'participant_update'
		});

	}

  setConnectionStatus = () => {

  }

	receiveDocumentValues = (dataDoc, dataDocInfo) => {
		this.collab.doc = dataDoc;
		this.collab.docInfo = dataDocInfo;
		this.collab.docInfo.changed = false;
		this.collab.docInfo.titleChanged = false;
	}


	// Get updates to document and then send updates to the server
	save = (callback) => {
		// console.log('Started save');
		const that = this;
		this.getUpdates(function() {
			that.sendDocumentUpdate(function() {
				// console.log('Finished save');
				if (callback) {
					callback();
				}
			});
		});
	}

	// Send changes to the document to the server
	sendDocumentUpdate = (callback) => {
		const documentData = {
			// title: this.doc.title,
			// metadata: this.doc.metadata,
			contents: this.collab.doc.contents,
			version: this.collab.doc.version,
			hash: this.collab.doc.hash
		};

		this.collab.mod.serverCommunications.send({
			type: 'update_document',
			document: documentData
		});

		this.collab.docInfo.changed = false;

		if (callback) {
			callback();
		}
		return true;
	}

	updateParticipants = (participants) => {
		// console.log('Got participants', participants);
		if (!this._calledComponentWillUnmount) {
			this.collab.mod.collab.updateParticipantList(participants);
			// this.setState({participants});
		}

	}

	proseChange = () => {
		// const md = markdownSerializer.serialize(pm.doc);
		// document.getElementById('markdown').value = md;
	}

	markdownChange = (evt) => {
		// this.pm.setDoc(markdownParser.parse(evt.target.value));
	}

	getSaveVersionContent = () => {
		return {
			// markdown: markdownSerializer.serialize(this.pm.doc),
			markdown: '',
			// docJSON: '',
			docJSON: this.getState().doc.toJSON(),
		};
	}

	toggleMarkdown = () => {
		this.setState({showMarkdown: !this.state.showMarkdown});
	}

  applyAction = (action) => {
    try {
  		const newState = this.view.state.apply(action);
  		this.view.updateState(newState);
      this.renderMenu();
    } catch (err) {
      console.log('Error applying state!', err);
    }
	}

  persistChanges = () => {
    console.log('persisting changes!');
    this.collab.mod.collab.docChanges.saveDocument();
  }

  getHash = () => {
		const doc = this.view.state.doc;
		return MD5(JSON.parse(JSON.stringify(doc.toJSON())), {unorderedArrays: true});
	}

  _onAction (action) {
    try {
      console.log('got action', action);
      const newState = this.view.state.apply(action);
      this.pm = newState;
      this.view.updateState(newState);
      // console.log(JSON.stringify(newState.doc.toJSON()));
      this.collab.mod.collab.docChanges.sendToCollaborators();
      this.renderMenu();
    } catch (err) {
      this.showError('Problem with input ', err)
      console.error(err);
    }
  }

}


exports.CollaborativeEditor = CollaborativeEditor;
