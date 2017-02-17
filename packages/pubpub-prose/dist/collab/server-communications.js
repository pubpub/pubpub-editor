'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.ModServerCommunications = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /* Sets up communicating with server (retrieving document,
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     saving, collaboration, etc.).
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     */

// import {collabServerUrl} from 'config';

var _prosemirrorCollab = require('prosemirror-collab');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var collabServerUrl = 'pubpub-collab-dev.herokuapp.com';

var ModServerCommunications = exports.ModServerCommunications = function () {
	function ModServerCommunications(editor) {
		var _this = this;

		_classCallCheck(this, ModServerCommunications);

		this.goOffline = function () {
			_this.online = false;
			_this.updateConnectionStatus();
			_this.close();
		};

		this.goOnline = function () {
			_this.online = true;
			window.clearTimeout(_this.retryTimeout);
			_this.updateConnectionStatus();
			_this.createWSConnection();
		};

		this.closeWindow = function () {
			if (_this.ws) {
				_this.ws.onclose = function () {};
				_this.ws.close();
			}
		};

		this.createWSConnection = function () {
			var that = _this;
			// const websocketProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';

			var wsServer = collabServerUrl;
			var websocketProtocol = void 0;
			if (wsServer.indexOf('localhost') !== -1) {
				websocketProtocol = 'ws:';
			} else {
				websocketProtocol = 'wss:';
			}

			var ws = void 0;
			var randomInt = Math.round(Math.random() * 100000);
			try {
				ws = new window.WebSocket(websocketProtocol + '//' + wsServer + '/ws/doc/' + _this.editor.doc_id + '?user=' + _this.editor.username + '&token=' + _this.editor.token + '&avatar_url=' + _this.editor.img + '&random=' + randomInt + '&repo_id=' + _this.editor.repoID);
				_this.ws = ws;
				// console.log('opening with', `${websocketProtofcol}//${wsServer}/ws/doc/${this.editor.doc.id}?user=${this.editor.username }&token=${this.editor.token}&avatar_url=${this.editor.img}&random=${randomInt}`);
				console.log('Opening connection');
				_this.ws.onopen = function () {
					console.log('Opened Connection');
					that.editor.setConnectionStatus('loading');
				};

				_this.ws.onerror = function (err) {
					console.log('error with socket');
					console.log(arguments);
				};
			} catch (err) {
				console.log('COULD NOT CLOSE WEBSOCKET');
				console.log(err);
				return;
			}

			_this.ws.onmessage = function (event) {
				var data = JSON.parse(event.data);
				that.stats.lastMessage = new Date();
				that.receive(data);
			};
			_this.ws.onclose = function (event) {
				if (that.broken) {
					return;
				}
				if (this.ws !== ws) {
					console.log('Got a close that isnt active');
					return;
				}
				this.ws.onmessage = function () {};
				this.ws.onclose = function () {};
				this.ws.onerror = function () {};
				console.log('Closed connection');
				that.connected = false;
				window.clearInterval(that.wsPinger);
				that.updateConnectionStatus();

				this.retryTimeout = window.setTimeout(function () {
					that.createWSConnection();
				}, 12000);
			};
			_this.wsPinger = window.setInterval(function () {
				that.send({
					'type': 'ping'
				});
			}, 30000);
		};

		this.close = function () {
			// console.log('Closed ws');
			console.log('Closing WS');
			window.clearTimeout(_this.retryTimeout);
			window.clearTimeout(_this.wsPinger);
			_this.ws.onmessage = function () {};
			_this.ws.onclose = function () {};
			_this.ws.onerror = function () {};
			_this.ws.close();
		};

		this.activateConnection = function () {
			// console.log('Activating connection');
			_this.connected = true;
			_this.updateConnectionStatus();
			if (_this.firstTimeConnection) {
				_this.editor.waitingForDocument = false;
				_this.editor.askForDocument();
			} else {
				// this.editor.mod.footnotes.fnEditor.renderAllFootnotes()
				var docChanges = _this.editor.mod.collab.docChanges;
				var unconfirmed = docChanges.checkUnconfirmedSteps();
				var toSend = _this.messagesToSend.length;
				_this.editor.waitingForDocument = false;
				console.log('Reactivated with ', unconfirmed, ' unconfirmed steps & ', toSend, 'steps to be sent');
				docChanges.checkDiffVersion();
				_this.send({
					type: 'participant_update'
				});
				while (_this.messagesToSend.length > 0) {
					_this.send(_this.messagesToSend.shift());
				}
			}
			_this.firstTimeConnection = false;
		};

		this.send = function (data) {
			if (_this.broken === true) {
				return;
			}
			data.token = _this.editor.token;
			data.id = _this.editor.doc_id;
			data.user = _this.editor.username;
			// console.log('Online: ', this.online, ' Connected: ', this.connected, ' Data: ', data);
			if (_this.connected && _this.online) {
				try {
					// console.log('sending: ', data.type);
					_this.ws.send(JSON.stringify(data));
				} catch (err) {
					console.log('Error sending socket');
					console.log(err);
					_this.updateConnectionStatus();
					// that.updateConnectionStatus();
				}
			} else if (data.type !== 'diff') {
				_this.messagesToSend.push(data);
			}
		};

		this.updateConnectionStatus = function () {
			var now = new Date();
			// console.log('updating status', this.connected, this.online);
			if (_this.connected && !_this.online || !_this.connected && _this.online) {
				_this.editor.setConnectionStatus('reconnecting');
			} else if (_this.connected && _this.online) {
				if (_this.statusInterval) {
					clearTimeout(_this.statusInterval);
				}
				// this.editor.setLoadingState(false);
				_this.editor.setConnectionStatus('connected');
			} else if (now - _this.stats.lastMessage <= 30 * 1000) {
				// this.editor.setErrorState('disconnect');
				_this.editor.setConnectionStatus('reconnecting');
				if (!_this.statusInterval) {
					_this.statusInterval = window.setInterval(_this.updateConnectionStatus.bind(_this), 1000);
				}
			} else {
				_this.editor.setConnectionStatus('disconnected');
				if (_this.statusInterval) {
					clearTimeout(_this.statusInterval);
				}
				// this.editor.setErrorState('timeout');
			}
		};

		this.receive = function (data) {
			// console.log(data);
			// console.log('receieved: ', data.type);
			switch (data.type) {
				case 'chat':
					_this.editor.mod.collab.chat.newMessage(data);
					break;
				case 'connections':
					// console.log('got connections!');
					// this.editor.mod.collab.updateParticipantList(data.participant_list);
					_this.editor.updateParticipants(data.participant_list);
					break;
				case 'welcome':
					_this.activateConnection();
					break;
				case 'document_data':
					_this.editor.receiveDocument(data);
					break;
				case 'confirm_diff_version':
					_this.editor.mod.collab.docChanges.cancelCurrentlyCheckingVersion();
					if (data.diff_version !== (0, _prosemirrorCollab.getVersion)(_this.editor.getState())) {
						_this.editor.mod.collab.docChanges.checkDiffVersion();
						return;
					}
					_this.editor.mod.collab.docChanges.enableDiffSending();
					break;
				case 'selection_change':
					// this.editor.mod.collab.docChanges.cancelCurrentlyCheckingVersion()
					// if (data.diff_version !== this.editor.pm.mod.collab.version) {
					//     this.editor.mod.collab.docChanges.checkDiffVersion()
					//     return
					// }
					_this.editor.mod.collab.carets.receiveSelectionChange(data);
					break;
				case 'diff':
					_this.editor.mod.collab.docChanges.receiveFromCollaborators(data);
					break;
				case 'confirm_diff':
					_this.editor.mod.collab.docChanges.confirmDiff(data.request_id);
					break;
				case 'setting_change':
					_this.editor.mod.settings.set.setSetting(data.variable, data.value, false);
					break;
				case 'check_hash':
					_this.editor.mod.collab.docChanges.checkHash(data.diff_version, data.hash);
					break;
				default:
					break;

			}
		};

		editor.mod.serverCommunications = this;
		this.editor = editor;
		/* A list of messages to be sent. Only used when temporarily offline.
  Messages will be sent when returning back online. */
		this.messagesToSend = [];
		this.connected = false;
		this.online = true;
		this.broken = false;
		/* Whether the connection is established for the first time. */
		this.firstTimeConnection = true;
		this.retryTimeout = null;
		this.statusInterval = null;

		this.stats = {
			lastMessage: null,
			lastConnection: null
		};

		window.addEventListener('online', this.goOnline);
		window.addEventListener('offline', this.goOffline);

		window.onbeforeunload = this.closeWindow;
	}

	_createClass(ModServerCommunications, [{
		key: 'init',
		value: function init() {
			this.createWSConnection();
		}
	}, {
		key: 'disconnect',
		value: function disconnect() {
			console.log('Disconnecting WS');
			this.connected = false;
			this.broken = true;
			window.clearTimeout(this.retryTimeout);
			window.clearTimeout(this.wsPinger);
			this.ws.onmessage = function () {};
			this.ws.onclose = function () {};
			this.ws.onerror = function () {};
			this.editor.setConnectionStatus('disconnected');
			this.ws.close();
		}

		/** Sends data to server or keeps it in a list if currently offline. */

	}]);

	return ModServerCommunications;
}();