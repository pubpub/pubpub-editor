'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _prosemirrorState = require('prosemirror-state');

var _schema = require('../schema');

var _require = require("prosemirror-view"),
    DecorationSet = _require.DecorationSet,
    Decoration = _require.Decoration;

var mentionsPlugin = new _prosemirrorState.Plugin({
	state: {
		init: function init(config, instance) {
			var set = DecorationSet.empty;
		},
		apply: function apply(transaction, state, prevEditorState, editorState) {

			var sel = editorState.selection;
			var updateMentions = this.spec.editorView.props.viewHandlers.updateMentions;

			if (!sel.empty) {
				updateMentions('');
				return { decos: DecorationSet.empty, start: null };
			}

			var doc = editorState.doc;
			var currentPos = editorState.selection.$to;
			var currentNode = editorState.doc.nodeAt(currentPos.pos - 1);
			if (currentNode && currentNode.text) {
				var currentLine = currentNode.text;
				var nextChIndex = currentPos.parentOffset;
				var nextCh = currentLine.length > nextChIndex ? currentLine.charAt(nextChIndex) : ' ';
				var prevChars = currentLine.substring(0, currentPos.parentOffset);
				var startIndex = Math.max(prevChars.lastIndexOf(' ') + 1, prevChars.lastIndexOf(' ') + 1);
				var startLetter = currentLine.charAt(startIndex);
				var shouldMark = startLetter === '@' && (nextCh.charCodeAt(0) === 32 || nextCh.charCodeAt(0) === 160);
				if (shouldMark) {
					var start = currentPos.pos - currentPos.parentOffset + startIndex;
					var end = currentPos.pos - currentPos.parentOffset + startIndex + 1;
					var decorations = [Decoration.inline(start, end, { class: 'mention-marker' })];
					var decos = DecorationSet.create(editorState.doc, decorations);

					updateMentions(currentLine.substring(start - 1, currentPos.pos));
					return { decos: decos, start: start, end: end };
				}
			}
			updateMentions('');
			return { decos: DecorationSet.empty, start: null };
		}
	},
	view: function view(editorView) {
		var _this = this;

		this.editorView = editorView;
		return {
			update: function update(newView, prevState) {
				_this.editorView = newView;
			},
			destroy: function destroy() {
				_this.editorView = null;
			}
		};
	},
	props: {
		decorations: function decorations(state) {
			if (state && this.getState(state) && this.getState(state).decos) {
				return this.getState(state).decos;
			}
			return null;
		},
		handleKeyDown: function handleKeyDown(view, evt) {
			var sel = view.state.selection;
			if (sel.empty && evt.type === 'keydown' && (evt.key === 'ArrowUp' || evt.key === 'ArrowDown')) {
				var pluginState = this.getState(view.state);
				var start = pluginState.start,
				    end = pluginState.end;

				if (start) {
					return true;
				}
			}
		}
	}
});

exports.default = mentionsPlugin;