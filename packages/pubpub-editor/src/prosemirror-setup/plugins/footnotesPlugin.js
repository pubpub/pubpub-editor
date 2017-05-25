import { Plugin } from 'prosemirror-state';
import { getPluginState } from '../plugins';
import { keys } from './pluginKeys';
import { schema } from '../schema';

const { DecorationSet, Decoration } = require('prosemirror-view');

const footnotesPlugin = new Plugin({
	state: {
		init(config, instance) {
			// const set = DecorationSet.empty;
			return { decos: DecorationSet.empty, start: null };
		},
		apply(transaction, state, prevEditorState, editorState) {

			const sel = editorState.selection;
			const updateMentions = this.spec.editorView.props.viewHandlers.updateMentions;

			if (!sel.empty) {
				updateMentions('');
				return { decos: DecorationSet.empty, start: null, };
			}

			const currentPos = editorState.selection.$to;
			const currentNode = editorState.doc.nodeAt(currentPos.pos - 1);


			if (currentNode && currentNode.text) {
				const currentLine = currentNode.text.replace(/\s/g, ' ');
				const nextCh = currentLine.length > nextChIndex ? currentLine.charAt(nextChIndex) : ' ';

				let parentOffset = currentPos.parentOffset;

				// sometimes the parent offset may not be describing the offset into the text node
				// if so, we need to correct for this.
				if (currentNode !== currentPos.parent) {
					const child = currentPos.parent.childAfter(currentPos.parentOffset - 1);
					if (child.node === currentNode) {
						parentOffset = parentOffset - child.offset;
					}
				}
				const nextChIndex = parentOffset;

				const prevChars = currentLine.substring(0, parentOffset);
				const startIndex = prevChars.lastIndexOf(' ') + 1;
				const startLetter = currentLine.charAt(startIndex);
				const shouldMark = startLetter === '@' && nextCh.charCodeAt(0) === 32;
				if (shouldMark) {
					const substring = currentLine.substring(startIndex + 1, nextChIndex) || ' ';
					const start = currentPos.pos - parentOffset + startIndex;
					const end = currentPos.pos - parentOffset + startIndex + 1 + substring.length;
					const decorations = [Decoration.inline(start, end, { class: 'mention-marker' })];
					const decos = DecorationSet.create(editorState.doc, decorations);

					// updateMentions(currentLine.substring(start - 1, currentPos.pos) || ' ');
					updateMentions(substring);
					return { decos: decos, start, end };
				}

			}
			updateMentions('');
			return { decos: DecorationSet.empty, start: null, end: null };
		}
	},
	view: function(editorView) {
		this.editorView = editorView;
		return {
			update: (newView, prevState) => {
				this.editorView = newView;
			},
			destroy: () => {
				this.editorView = null;
			}
		};
	},
	props: {
		createMention(view, text) {
			const state = view.state;
			const pluginState = getPluginState('mentions', state);
			if (pluginState) {
				const { start, end } = pluginState;
				if (start === null) { return null; }
				const transaction = state.tr.replaceRangeWith(start, end, schema.nodes.mention.create({ editing: true, text: text }));
				return view.dispatch(transaction);
			}
			return null;
		},

		getMentionPos(view) {
			const state = view.state;
			const pluginState = getPluginState('mentions', state);
			if (pluginState) {
				const { start, end } = pluginState;
				return { start, end };
			}
			return null;
		},

		decorations(state) {
			if (state && this.getState(state) && this.getState(state).decos) {
				return this.getState(state).decos;
			}
			return null;
		},
		handleDOMEvents: {
			keydown: (view, evt)=> {
				const sel = view.state.selection;
				if (sel.empty && evt.type === 'keydown' && (evt.key === 'ArrowUp' || evt.key === 'ArrowDown' || evt.key === 'Enter')) {
					const pluginState = getPluginState('mentions', view.state);
					if (pluginState.start !== null) {
						evt.preventDefault();
						return true;
					}
				}
				return false;
			},
		},
	},
	key: keys.mentions
});

export default footnotesPlugin;
