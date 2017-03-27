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
        updateMentions('no mentions');
        return { decos: DecorationSet.empty };
      }
      const doc = editorState.doc;
      const pos = sel.$from.pos;
      const textNode = editorState.doc.nodeAt(pos);
      if (textNode) {
          const textContent = textNode.text;

          const start = sel.$from.pos;
          const end = sel.$from.pos + 2;
          const decorations = [Decoration.inline(start, end,
            {class: 'selection-marker'},
            { inclusiveLeft: true,
              inclusiveRight: true,
            }
          )];
  				const decos = DecorationSet.create(editorState.doc, decorations);

          console.log(this.spec.editorView.props);
          updateMentions('hi');
          return {decos: decos, start, end};
      }
      updateMentions('no mentions');
      return {decos: DecorationSet.empty, start: sel.$from.pos, };
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


      if (evt.type === 'keydown' && evt.key === 'ArrowUp') {
        const sel = view.state.selection;
        if (!sel.empty) {
          return false;
        }
        const selFrom = sel.$from.pos;
        const pluginState = this.getState(view.state);
        const {start, end} = pluginState;
        console.log('Got', start, end, selFrom);
        if (start && selFrom >= start && selFrom <= end) {
          return true;
        }
      }
      // console.log(evt, evt.type);
    }
  }
});

export default mentionsPlugin;
