'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _plugins = require('../plugins');

var _setup = require('../setup');

var _baseEditor = require('./baseEditor');

var _objectHash = require('object-hash');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var CollaborativeEditor = function (_BaseEditor) {
	_inherits(CollaborativeEditor, _BaseEditor);

	function CollaborativeEditor(_ref) {
		var place = _ref.place,
		    contents = _ref.contents,
		    text = _ref.text,
		    fileMap = _ref.fileMap,
		    _ref$collab = _ref.collab,
		    userID = _ref$collab.userID,
		    token = _ref$collab.token,
		    username = _ref$collab.username,
		    docID = _ref$collab.docID,
		    repoID = _ref$collab.repoID,
		    serverURL = _ref$collab.serverURL,
		    createFile = _ref.handlers.createFile;

		_classCallCheck(this, CollaborativeEditor);

		var _this = _possibleConstructorReturn(this, (CollaborativeEditor.__proto__ || Object.getPrototypeOf(CollaborativeEditor)).call(this));

		_initialiseProps.call(_this);

		var tokenInfo = {
			username: username,
			docid: docID,
			token: token,
			repoID: repoID
		};

		var clientID = userID + '-' + Math.round(Math.random() * 1000);
		_this.clientID = clientID;
		// console.log('with client ID', clientID);

		var _require = require('../collab/server-communications'),
		    ModServerCommunications = _require.ModServerCommunications;

		var _require2 = require('../collab/mod'),
		    ModCollab = _require2.ModCollab;

		var tokenValid = true;

		var that = _this;

		var collab = {};
		collab.docInfo = {
			rights: '',
			last_diffs: [],
			is_owner: false,
			is_new: false,
			titleChanged: false,
			changed: false
		};
		collab.mod = {};
		collab.waitingForDocument = true;
		collab.schema = _setup.schema;
		collab.receiveDocument = _this.receiveDocument;
		collab.receiveDocumentValues = _this.receiveDocumentValues;
		collab.askForDocument = _this.askForDocument;
		collab.getHash = _this.getHash;
		collab.updateParticipants = _this.updateParticipants;
		collab.applyAction = _this.applyAction;
		collab.getId = _this.getId;

		collab.getState = function () {
			return _this.view.state;
		};

		collab.setConnectionStatus = _this.setConnectionStatus;

		collab.setParticipants = function (participants) {
			// that.setState({participants: participants});
		};

		// Collaboration Authentication information
		collab.doc_id = tokenInfo.docid;
		collab.repoID = tokenInfo.repoID;
		collab.username = tokenInfo.username;
		collab.token = tokenInfo.token;
		collab.img = 'google.com';
		collab.doc = { id: tokenInfo.docid };
		_this.collab = collab;

		new ModServerCommunications(collab, serverURL);
		new ModCollab(collab);

		// this.setSaveTimers();

		var _require3 = require('../setup'),
		    pubpubSetup = _require3.pubpubSetup;

		var _require4 = require("../markdown"),
		    markdownParser = _require4.markdownParser;

		var collabEditing = require('prosemirror-collab').collab;

		var plugins = pubpubSetup({ schema: _setup.schema }).concat(_plugins.CitationsPlugin).concat(_plugins.SelectPlugin).concat(_plugins.RelativeFilesPlugin).concat(collabEditing({ version: 0, clientID: clientID }));

		var docJSON = void 0;
		if (text) {
			docJSON = markdownParser.parse(text).toJSON();
		} else {
			docJSON = contents;
		}
		_this.place = place;
		_this.createFile = createFile;
		_this.plugins = plugins;
		_this.fileMap = fileMap;
		_this.collab.mod.serverCommunications.init();

		_this.remove = _this.remove.bind(_this);
		return _this;
	}

	_createClass(CollaborativeEditor, [{
		key: 'remove',
		value: function remove() {
			_get(CollaborativeEditor.prototype.__proto__ || Object.getPrototypeOf(CollaborativeEditor.prototype), 'remove', this).call(this);
			this.collab.mod.serverCommunications.close();
		}

		// Get updates to document and then send updates to the server


		// Send changes to the document to the server

	}, {
		key: '_onAction',
		value: function _onAction(action) {
			try {
				console.log('got action', action);
				var newState = this.view.state.apply(action);
				this.pm = newState;
				this.view.updateState(newState);
				// console.log(JSON.stringify(newState.doc.toJSON()));
				this.collab.mod.collab.docChanges.sendToCollaborators();
				this.renderMenu();
			} catch (err) {
				this.showError('Problem with input ', err);
				console.error(err);
			}
		}
	}]);

	return CollaborativeEditor;
}(_baseEditor.BaseEditor);

var _initialiseProps = function _initialiseProps() {
	var _this2 = this;

	this.loadDocument = function () {

		_this2.collab.waitingForDocument = false;
		(0, _setup.migrateMarks)(_this2.collab.doc.contents);

		var docJSON = _this2.collab.doc.contents;
		if (docJSON.content && docJSON.content[docJSON.content.length - 1].type !== "citations") {
			var citationsObj = { "content": [], "type": "citations" };
			docJSON.content.push(citationsObj);
		}

		_this2.create({ place: _this2.place, contents: docJSON, config: { fileMap: _this2.fileMap }, plugins: _this2.plugins, handlers: { createFile: _this2.createFile } });
		// console.log(docJSON);

		(0, _setup.migrateDiffs)(_this2.collab.docInfo.last_diffs);
		// console.log('Got diffs!', this.collab.docInfo.last_diffs);
		var appliedAction = _this2.collab.mod.collab.docChanges.applyAllDiffs(_this2.collab.docInfo.last_diffs);
		if (appliedAction) {
			// this.applyAction(appliedAction);
		} else {
			// indicates that the DOM is broken and cannot be repaired
			_this2.collab.mod.serverCommunications.disconnect();
		}
	};

	this.getState = function () {
		return _this2.view.state;
	};

	this.getId = function () {
		return _this2.clientID;
	};

	this.askForDocument = function () {
		if (_this2.collab.waitingForDocument) {
			return;
		}
		_this2.collab.waitingForDocument = true;
		_this2.collab.mod.serverCommunications.send({
			type: 'get_document'
		});
	};

	this.receiveDocument = function (data) {
		// const that = this;
		_this2.collab.receiveDocumentValues(data.document, data.document_values);
		_this2.loadDocument();
		if (data.hasOwnProperty('user')) {
			_this2.collab.user = data.user;
		}

		_this2.collab.mod.serverCommunications.send({
			type: 'participant_update'
		});
	};

	this.setConnectionStatus = function () {};

	this.receiveDocumentValues = function (dataDoc, dataDocInfo) {
		_this2.collab.doc = dataDoc;
		_this2.collab.docInfo = dataDocInfo;
		_this2.collab.docInfo.changed = false;
		_this2.collab.docInfo.titleChanged = false;
	};

	this.save = function (callback) {
		// console.log('Started save');
		var that = _this2;
		_this2.getUpdates(function () {
			that.sendDocumentUpdate(function () {
				// console.log('Finished save');
				if (callback) {
					callback();
				}
			});
		});
	};

	this.sendDocumentUpdate = function (callback) {
		var documentData = {
			// title: this.doc.title,
			// metadata: this.doc.metadata,
			contents: _this2.collab.doc.contents,
			version: _this2.collab.doc.version,
			hash: _this2.collab.doc.hash
		};

		_this2.collab.mod.serverCommunications.send({
			type: 'update_document',
			document: documentData
		});

		_this2.collab.docInfo.changed = false;

		if (callback) {
			callback();
		}
		return true;
	};

	this.updateParticipants = function (participants) {
		// console.log('Got participants', participants);
		if (!_this2._calledComponentWillUnmount) {
			_this2.collab.mod.collab.updateParticipantList(participants);
			// this.setState({participants});
		}
	};

	this.proseChange = function () {
		// const md = markdownSerializer.serialize(pm.doc);
		// document.getElementById('markdown').value = md;
	};

	this.markdownChange = function (evt) {
		// this.pm.setDoc(markdownParser.parse(evt.target.value));
	};

	this.getSaveVersionContent = function () {
		return {
			// markdown: markdownSerializer.serialize(this.pm.doc),
			markdown: '',
			// docJSON: '',
			docJSON: _this2.getState().doc.toJSON()
		};
	};

	this.toggleMarkdown = function () {
		_this2.setState({ showMarkdown: !_this2.state.showMarkdown });
	};

	this.applyAction = function (action) {
		try {
			var newState = _this2.view.state.apply(action);
			_this2.view.updateState(newState);
			_this2.renderMenu();
		} catch (err) {
			console.log('Error applying state!', err);
		}
	};

	this.persistChanges = function () {
		console.log('persisting changes!');
		_this2.collab.mod.collab.docChanges.saveDocument();
	};

	this.getHash = function () {
		var doc = _this2.view.state.doc;
		return (0, _objectHash.MD5)(JSON.parse(JSON.stringify(doc.toJSON())), { unorderedArrays: true });
	};
};

exports.CollaborativeEditor = CollaborativeEditor;