'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _prosemirrorView = require('prosemirror-view');

var _prosemirrorState = require('prosemirror-state');

// use transform.docs for each step?

var SelectPlugin = new _prosemirrorState.Plugin({
  state: {
    init: function init(config, instance) {
      return { deco: _prosemirrorView.DecorationSet.empty };
    },
    apply: function apply(transaction, state, prevEditorState, editorState) {
      var sel = transaction.curSelection;
      if (transaction.getMeta('markRange')) {
        for (var i = 0; i < transform.steps.length; i++) {
          var map = transform.maps[i];
          for (var r = 0; r < map.ranges.length; r += 3) {
            this.recordRange(transform.docs[i], map.ranges[r], map.ranges[r] + map.ranges[r + 1], author, updated);
          }this.changes = mapChanges(this.changes, map, author, updated, transform.docs[i + 1] || transform.doc);
          updated.length = 0;
        }
      }
      if (sel) {
        var decos = [_prosemirrorView.Decoration.inline(sel.$from.pos, sel.$to.pos, { class: 'selection-marker' }, { inclusiveLeft: true,
          inclusiveRight: true
        })];
        var deco = _prosemirrorView.DecorationSet.create(editorState.doc, decos);
        return { deco: deco };
      }

      return state;
    }
  },
  props: {
    decorations: function decorations(state) {
      if (state && this.getState(state)) {
        return this.getState(state).deco;
      }
      return null;
    }
  }
});

exports.default = SelectPlugin;