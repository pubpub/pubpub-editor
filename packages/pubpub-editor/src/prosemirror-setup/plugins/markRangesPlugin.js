import {Decoration, DecorationSet} from "prosemirror-view";

import {Plugin} from 'prosemirror-state';

// use transform.docs for each step?

const SelectPlugin = new Plugin({
  state: {
    init(config, instance) {
      return { deco: DecorationSet.empty };
    },
    apply(transaction, state, prevEditorState, editorState) {
      const sel = transaction.curSelection;
      if (transaction.getMeta('markRange')) {
        for (let i = 0; i < transform.steps.length; i++) {
          let map = transform.maps[i]
          for (let r = 0; r < map.ranges.length; r += 3)
            this.recordRange(transform.docs[i], map.ranges[r], map.ranges[r] + map.ranges[r + 1], author, updated)
          this.changes = mapChanges(this.changes, map, author, updated, transform.docs[i + 1] || transform.doc)
          updated.length = 0
        }
      }
			if (sel) {
        const decos = [Decoration.inline(sel.$from.pos, sel.$to.pos,
          {class: 'selection-marker'},
          { inclusiveLeft: true,
            inclusiveRight: true,
          }
        )];
				const deco = DecorationSet.create(editorState.doc, decos);
				return {deco};
			}

      return state;
    }
  },
  props: {
    decorations(state) {
      if (state && this.getState(state)) {
        return this.getState(state).deco;
      }
      return null;
    }
  }
});

export default SelectPlugin;
