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
        updateMentions('inactive');
        return {decos: DecorationSet.empty, start: null, };
      }
      const doc = editorState.doc;
      const currentPos = editorState.selection.$to;
      const currentNode = editorState.doc.nodeAt(currentPos.pos - 1);
      // const pos = sel.$to.pos;
      // const textNode = editorState.doc.nodeAt(pos);
      // if (textNode) {
      if (currentNode && currentNode.text) {
          // const textContent = textNode.text;
          const currentLine = currentNode.text;
          const nextChIndex = currentPos.parentOffset;
          const nextCh = currentLine.length > nextChIndex ? currentLine.charAt(nextChIndex) : ' ';
          // console.log(currentCursor);
          const prevChars = currentLine.substring(0, currentPos.parentOffset );
          const startIndex = Math.max(prevChars.lastIndexOf(' ') + 1, prevChars.lastIndexOf(' ') + 1);
          const startLetter = currentLine.charAt(startIndex);
          // console.log(prevChars.lastIndexOf(' ') + 1, currentCursor.ch);
          const shouldMark = startLetter === '@' && (nextCh.charCodeAt(0) === 32 || nextCh.charCodeAt(0) === 160);
          if (shouldMark) {
            const start = currentPos.pos - currentPos.parentOffset + startIndex;
            const end = currentPos.pos - currentPos.parentOffset + startIndex + 1;
            // const start = sel.$from.pos;
            // const end = sel.$from.pos + 2;
            const decorations = [Decoration.inline(start, end,
              {class: 'mention-marker'},
              { inclusiveLeft: true,
                inclusiveRight: true,
              }
            )];
            const decos = DecorationSet.create(editorState.doc, decorations);

            // console.log(this.spec.editorView.props);
            updateMentions('active');
            return {decos: decos, start, end};
          }
          
      }
      updateMentions('inactive');
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
      // console.log('Got key');
      console.log(evt.type, evt.key);


      if (evt.type === 'keydown' && (evt.key === 'ArrowUp' || evt.key === 'ArrowDown')) {
        const sel = view.state.selection;
        if (!sel.empty) {
          return false;
        }
        // const selFrom = sel.$from.pos;
        const pluginState = this.getState(view.state);
        const {start, end} = pluginState;
        // console.log('Got', start, end, selFrom);
        // if (start && selFrom >= start && selFrom <= end) {
        if (start) {
          return true;
        }
      }
      // console.log(evt, evt.type);
    }
  }
});

export default mentionsPlugin;
