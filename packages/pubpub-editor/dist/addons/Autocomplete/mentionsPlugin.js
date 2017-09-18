'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _prosemirrorState = require('prosemirror-state');

var _plugins = require('../plugins');

var _pluginKeys = require('./pluginKeys');

var _require = require('prosemirror-view'),
    DecorationSet = _require.DecorationSet,
    Decoration = _require.Decoration;

var mentionsPlugin = new _prosemirrorState.Plugin({
	state: {
		init: function init(config, instance) {
			// const set = DecorationSet.empty;
			return { decos: DecorationSet.empty, start: null };
		},
		apply: function apply(transaction, state, prevEditorState, editorState) {

			var sel = editorState.selection;
			var updateMentions = this.spec.editorView.props.viewHandlers.updateMentions;

			if (!sel.empty) {
				updateMentions('');
				return { decos: DecorationSet.empty, start: null };
			}

			var currentPos = editorState.selection.$to;
			var currentNode = editorState.doc.nodeAt(currentPos.pos - 1);

			if (currentNode && currentNode.text) {
				var currentLine = currentNode.text.replace(/\s/g, ' ');
				var nextCh = currentLine.length > nextChIndex ? currentLine.charAt(nextChIndex) : ' ';

				var parentOffset = currentPos.parentOffset;

				// sometimes the parent offset may not be describing the offset into the text node
				// if so, we need to correct for this.
				if (currentNode !== currentPos.parent) {
					var child = currentPos.parent.childAfter(currentPos.parentOffset - 1);
					if (child.node === currentNode) {
						parentOffset = parentOffset - child.offset;
					}
				}
				var nextChIndex = parentOffset;

				var prevChars = currentLine.substring(0, parentOffset);
				var startIndex = prevChars.lastIndexOf(' ') + 1;
				var startLetter = currentLine.charAt(startIndex);
				var shouldMark = startLetter === '@' && nextCh.charCodeAt(0) === 32;
				if (shouldMark) {
					var substring = currentLine.substring(startIndex + 1, nextChIndex) || ' ';
					var start = currentPos.pos - parentOffset + startIndex;
					var end = currentPos.pos - parentOffset + startIndex + 1 + substring.length;
					var decorations = [Decoration.inline(start, end, { class: 'mention-marker' })];
					var decos = DecorationSet.create(editorState.doc, decorations);

					// updateMentions(currentLine.substring(start - 1, currentPos.pos) || ' ');
					updateMentions(substring);
					return { decos: decos, start: start, end: end };
				}
			}
			updateMentions('');
			return { decos: DecorationSet.empty, start: null, end: null };
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
		createMention: function createMention(view, text) {
			var state = view.state;
			var pluginState = (0, _plugins.getPluginState)('mentions', state);
			if (pluginState) {
				var start = pluginState.start,
				    end = pluginState.end;

				if (start === null) {
					return null;
				}
				var transaction = state.tr.replaceRangeWith(start, end, view.state.schema.nodes.mention.create({ editing: true, text: text }));
				return view.dispatch(transaction);
			}
			return null;
		},
		getMentionPos: function getMentionPos(view) {
			var state = view.state;
			var pluginState = (0, _plugins.getPluginState)('mentions', state);
			if (pluginState) {
				var start = pluginState.start,
				    end = pluginState.end;

				return { start: start, end: end };
			}
			return null;
		},
		decorations: function decorations(state) {
			if (state && this.getState(state) && this.getState(state).decos) {
				return this.getState(state).decos;
			}
			return null;
		},

		handleDOMEvents: {
			keydown: function keydown(view, evt) {
				var sel = view.state.selection;
				if (sel.empty && evt.type === 'keydown' && (evt.key === 'ArrowUp' || evt.key === 'ArrowDown' || evt.key === 'Enter')) {
					var pluginState = (0, _plugins.getPluginState)('mentions', view.state);
					if (pluginState.start !== null) {
						evt.preventDefault();
						return true;
					}
				}
				return false;
			}
		}
	},
	key: _pluginKeys.keys.mentions
});

exports.default = mentionsPlugin;