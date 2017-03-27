import {Plugin} from 'prosemirror-state';
import { schema } from '../schema';
const { DecorationSet, Decoration } = require("prosemirror-view");

const mentionsPlugin = new Plugin({
	state: {
		init(config, instance) {
			const set = DecorationSet.empty;
		},
		apply(transaction, state, prevEditorState, editorState) {

			const sel = editorState.selection;
			const updateMentions = this.spec.editorView.props.viewHandlers.updateMentions;

			if (!sel.empty) {
				updateMentions('');
				return {decos: DecorationSet.empty, start: null, };
			}

			const doc = editorState.doc;
			const currentPos = editorState.selection.$to;
			const currentNode = editorState.doc.nodeAt(currentPos.pos - 1);
			if (currentNode && currentNode.text) {
				const currentLine = currentNode.text;
				const nextChIndex = currentPos.parentOffset;
				const nextCh = currentLine.length > nextChIndex ? currentLine.charAt(nextChIndex) : ' ';
				const prevChars = currentLine.substring(0, currentPos.parentOffset );
				const startIndex = Math.max(prevChars.lastIndexOf(' ') + 1, prevChars.lastIndexOf(' ') + 1);
				const startLetter = currentLine.charAt(startIndex);
				const shouldMark = startLetter === '@' && (nextCh.charCodeAt(0) === 32 || nextCh.charCodeAt(0) === 160);
				if (shouldMark) {
					const start = currentPos.pos - currentPos.parentOffset + startIndex;
					const end = currentPos.pos - currentPos.parentOffset + startIndex + 1;
					const decorations = [Decoration.inline(start, end, {class: 'mention-marker'})];
					const decos = DecorationSet.create(editorState.doc, decorations);

					updateMentions(currentLine.substring(start - 1, currentPos.pos));
					return {decos: decos, start, end};
				}
					
			}
			updateMentions('');
			return {decos: DecorationSet.empty, start: null, };
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
		}
	},
	props: {
		decorations(state) {
			if (state && this.getState(state) && this.getState(state).decos) {
				return this.getState(state).decos;
			}
			return null;
		},
		handleKeyDown(view, evt) {
			const sel = view.state.selection;
			if (sel.empty && evt.type === 'keydown' && (evt.key === 'ArrowUp' || evt.key === 'ArrowDown')) {
				const pluginState = this.getState(view.state);
				const {start, end} = pluginState;
				if (start) { return true; }
			}
		}
	}
});

export default mentionsPlugin;
