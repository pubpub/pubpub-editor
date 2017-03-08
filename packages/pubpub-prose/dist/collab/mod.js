'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.ModCollab = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /* eslint no-new: 0 */

var _carets = require('./carets');

var _docChanges = require('./doc-changes');

var _groupBy = require('lodash/groupBy');

var _groupBy2 = _interopRequireDefault(_groupBy);

var _map = require('lodash/map');

var _map2 = _interopRequireDefault(_map);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// import {ModCollabChat} from './chat';
// import {ModCollabColors} from './colors';
var ModCollab = exports.ModCollab = function () {
	function ModCollab(editor) {
		_classCallCheck(this, ModCollab);

		editor.mod.collab = this;
		this.editor = editor;
		this.participants = [];
		this.colorIds = {};
		this.sessionIds = [];
		this.newColor = 0;
		this.collaborativeMode = false;
		new _docChanges.ModCollabDocChanges(this);
		new _carets.ModCollabCarets(this);
		// ModCollabChat(this);
		// ModCollabColors(this);
	}

	_createClass(ModCollab, [{
		key: 'updateParticipantList',
		value: function updateParticipantList(participants) {
			// const that = this;

			this.editor.setParticipants(participants);
			var titleUserDivs = document.getElementsByClassName('title-connected-user');

			for (var index = titleUserDivs.length - 1; index >= 0; index--) {
				titleUserDivs[index].parentNode.removeChild(titleUserDivs[index]);
			}

			/*
   for (let index = 0; index < participants.length; index++) {
   	const appendStr = '<div><img class="title-connected-user" style="display: inline-block; padding: 2px 2px;" title="' + participants[index].name + '" src="https://jake.pubpub.org/unsafe/fit-in/25x25/' + participants[index].avatar_url + '"></div>';
   	menubar.innerHTML = menubar.innerHTML + appendStr;
   }
   */

			var allSessionIds = [];
			var that = this;

			var grouped = (0, _groupBy2.default)(participants, 'id');
			this.participants = (0, _map2.default)(grouped, function (entries) {
				var sessionIds = [];
				// Collect all Session IDs.
				entries.forEach(function (entry) {
					sessionIds.push(entry.session_id);
					allSessionIds.push(entry.session_id);
					delete entry.session_id;
				});
				entries[0].sessionIds = sessionIds;
				return entries[0];
			});
			// Check if each of the old session IDs is still present in last update.
			// If not, remove the corresponding marked range, if any.
			this.sessionIds.forEach(function (sessionId) {
				if (allSessionIds.indexOf(sessionId) === -1) {
					that.carets.removeSelection(sessionId);
				}
			});

			this.sessionIds = allSessionIds;
			if (participants.length > 1) {
				this.collaborativeMode = true;
			} else if (participants.length === 1) {
				this.collaborativeMode = false;
			}

			// this.participants.forEach(function(participant) {
			//     /* We assign a color to each user. This color stays even if the user
			//     * disconnects or the participant list is being updated.
			//     */
			//     if (!(participant.id in that.colorIds)) {
			//         that.colorIds[participant.id] = that.newColor
			//         that.newColor++
			//     }
			//     participant.colorId = that.colorIds[participant.id]
			// })
			// this.colors.provideUserColorStyles(this.newColor)
			// this.chat.updateParticipantList(participants)
		}
	}]);

	return ModCollab;
}();