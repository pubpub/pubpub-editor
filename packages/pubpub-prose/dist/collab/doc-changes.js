'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.ModCollabDocChanges = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _prosemirrorCollab = require('prosemirror-collab');

var _prosemirrorTransform = require('prosemirror-transform');

var _setup = require('../setup');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ModCollabDocChanges = exports.ModCollabDocChanges = function () {
	function ModCollabDocChanges(mod) {
		var _this = this;

		_classCallCheck(this, ModCollabDocChanges);

		this.checkUnconfirmedSteps = function () {
			return Object.keys(_this.unconfirmedSteps).length;
		};

		this.sendToCollaborators = function () {
			if (_this.awaitingDiffResponse || !(0, _prosemirrorCollab.sendableSteps)(_this.mod.editor.getState())) {
				// this.mod.editor.mod.comments.store.unsentEvents().length === 0) {
				// We are waiting for the confirmation of previous steps, so don't
				// send anything now, or there is nothing to send.
				return;
			}

			var toSend = (0, _prosemirrorCollab.sendableSteps)(_this.mod.editor.getState());
			var requestId = _this.confirmStepsRequestCounter++;
			var aPackage = {
				type: 'diff',
				diff_version: (0, _prosemirrorCollab.getVersion)(_this.mod.editor.getState()),
				diff: toSend.steps.map(function (sIndex) {
					var step = sIndex.toJSON();
					step.client_id = _this.mod.editor.getId();
					return step;
				}),
				// footnote_diff: fnToSend.steps.map(s => {
				//     let step = s.toJSON()
				//     step.client_id = this.mod.editor.mod.footnotes.fnPm.mod.collab.clientID
				//     return step
				// }),
				// comments: this.mod.editor.mod.comments.store.unsentEvents(),
				// comment_version: this.mod.editor.mod.comments.store.version,
				request_id: requestId,
				hash: _this.mod.editor.getHash(),
				token: _this.mod.editor.token
			};
			_this.mod.editor.mod.serverCommunications.send(aPackage);
			_this.unconfirmedSteps[requestId] = {
				diffs: toSend.steps
			};
			_this.disableDiffSending();
		};

		this.confirmDiff = function (requestId) {
			var that = _this;
			var diffs = _this.unconfirmedSteps[requestId].diffs;

			var clientIds = diffs.map(function (step) {
				return that.mod.editor.getId();
			});

			var action = _this.receiveAction(diffs, clientIds, true);
			action.requestDone = true;
			if (!action) {
				console.log('Could not apply diff!');
			}
			_this.mod.editor.applyAction(action);

			// let sentFnSteps = this.unconfirmedSteps[requestId]["footnote_diffs"]
			// this.mod.editor.mod.footnotes.fnPm.mod.collab.receive(sentFnSteps, sentFnSteps.map(function(step){
			//     return that.mod.editor.mod.footnotes.fnPm.mod.collab.clientID
			// }))

			// let sentComments = this.unconfirmedSteps[requestId]["comments"]
			// this.mod.editor.mod.comments.store.eventsSent(sentComments)

			if (_this.unconfirmedSteps[requestId]) {
				delete _this.unconfirmedSteps[requestId];
			} else {
				console.log('Could not enable diff');
				console.log(requestId);
				console.log(_this.unconfirmedSteps);
			}

			_this.enableDiffSending();
		};

		this.applyDiff = function (diff) {
			_this.receiving = true;
			var steps = [diff].map(function (jIndex) {
				return _prosemirrorTransform.Step.fromJSON(_setup.schema, jIndex);
			});
			var clientIds = [diff].map(function (jIndex) {
				return jIndex.client_id;
			});
			var action = _this.receiveAction(steps, clientIds);
			_this.mod.editor.applyAction(action);
			_this.receiving = false;
		};

		this.applyAllDiffs = function (diffs) {
			var transaction = null;
			_this.receiving = true;

			try {
				var steps = diffs.map(function (jIndex) {
					return _prosemirrorTransform.Step.fromJSON(_setup.schema, jIndex);
				});
				var clientIds = diffs.map(function (jIndex) {
					return jIndex.client_id;
				});
				transaction = _this.receiveAction(steps, clientIds);
				transaction.setMeta("docReset", true);
				_this.mod.editor.applyAction(transaction);
			} catch (err) {
				console.log('ERROR: ', err);
			}

			_this.receiving = false;
			return transaction;
		};

		this.receiveAction = function (steps, clientIDs) {
			var ours = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;


			var state = _this.mod.editor.getState();
			var userID = _this.mod.editor.getId();
			var modifiedClientIDs = void 0;

			if (!ours) {
				modifiedClientIDs = clientIDs.map(function (clientID) {
					if (clientID === userID) {
						return 'self';
					} else {
						return clientID;
					}
				});
			} else {
				modifiedClientIDs = clientIDs;
			}

			return (0, _prosemirrorCollab.receiveTransaction)(state, steps, modifiedClientIDs);
		};

		mod.docChanges = this;
		this.mod = mod;

		this.unconfirmedSteps = {};
		this.confirmStepsRequestCounter = 0;
		this.awaitingDiffResponse = false;
		this.receiving = false;
		this.currentlyCheckingVersion = false;
	}

	_createClass(ModCollabDocChanges, [{
		key: 'checkHash',
		value: function checkHash(version, hash) {
			if (version === (0, _prosemirrorCollab.getVersion)(this.mod.editor.getState())) {
				if (hash === this.mod.editor.getHash()) {
					return true;
				}
				this.disableDiffSending();
				this.mod.editor.askForDocument();
				return false;
			}
			this.checkDiffVersion();
			return false;
		}
	}, {
		key: 'cancelCurrentlyCheckingVersion',
		value: function cancelCurrentlyCheckingVersion() {
			this.currentlyCheckingVersion = false;
			window.clearTimeout(this.enableCheckDiffVersion);
		}
	}, {
		key: 'checkDiffVersion',
		value: function checkDiffVersion() {
			var that = this;
			if (this.currentlyCheckingVersion) {
				return;
			}
			this.currentlyCheckingVersion = true;
			this.enableCheckDiffVersion = window.setTimeout(function () {
				that.currentlyCheckingVersion = false;
			}, 1000);
			if (this.mod.editor.mod.serverCommunications.connected) {
				this.disableDiffSending();
			}
			this.mod.editor.mod.serverCommunications.send({
				type: 'check_diff_version',
				diff_version: (0, _prosemirrorCollab.getVersion)(this.mod.editor.getState())
			});
		}
	}, {
		key: 'disableDiffSending',
		value: function disableDiffSending() {
			var that = this;
			this.awaitingDiffResponse = true;
			// If no answer has been received from the server within 2 seconds, check the version
			this.checkDiffVersionTimer = window.setTimeout(function () {
				that.awaitingDiffResponse = false;
				that.sendToCollaborators();
				that.checkDiffVersion();
			}, 2000);
		}
	}, {
		key: 'enableDiffSending',
		value: function enableDiffSending() {
			window.clearTimeout(this.checkDiffVersionTimer);
			this.awaitingDiffResponse = false;
			this.sendToCollaborators();
		}
	}, {
		key: 'receiveFromCollaborators',
		value: function receiveFromCollaborators(data) {
			var that = this;
			if (this.mod.editor.waitingForDocument) {
				// We are currently waiting for a complete editor update, so
				// don't deal with incoming diffs.
				return undefined;
			}
			var editorHash = this.mod.editor.getHash();
			if (data.diff_version !== (0, _prosemirrorCollab.getVersion)(this.mod.editor.getState())) {

				this.checkDiffVersion();
				return undefined;
			}

			if (data.hash && data.hash !== editorHash) {
				return false;
			}
			if (data.diff && data.diff.length) {
				data.diff.forEach(function (diff) {
					that.applyDiff(diff);
				});
			}
			if (data.reject_request_id) {
				console.log('Rejected this diff');
				this.rejectDiff(data.reject_request_id);
			}
			if (!data.hash) {
				// No hash means this must have been created server side.
				this.cancelCurrentlyCheckingVersion();
				this.enableDiffSending();
			}
		}
	}, {
		key: 'rejectDiff',
		value: function rejectDiff(requestId) {
			this.enableDiffSending();
			delete this.unconfirmedSteps[requestId];
			this.sendToCollaborators();
		}
	}, {
		key: 'applyAllDiffsSequential',
		value: function applyAllDiffsSequential(diffs) {
			var action = null;
			this.receiving = true;

			var _iteratorNormalCompletion = true;
			var _didIteratorError = false;
			var _iteratorError = undefined;

			try {
				for (var _iterator = diffs[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
					var diff = _step.value;

					try {
						var steps = [diff].map(function (jIndex) {
							return _prosemirrorTransform.Step.fromJSON(_setup.schema, jIndex);
						});
						var clientIds = [diff].map(function (jIndex) {
							return jIndex.client_id;
						});
						action = this.receiveAction(steps, clientIds);
						this.mod.editor.applyAction(action);
					} catch (err) {
						console.log('ERROR: ', err);
						console.log(diff);
					}
				}
			} catch (err) {
				_didIteratorError = true;
				_iteratorError = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion && _iterator.return) {
						_iterator.return();
					}
				} finally {
					if (_didIteratorError) {
						throw _iteratorError;
					}
				}
			}

			this.receiving = false;
			return action;
		}
	}]);

	return ModCollabDocChanges;
}();