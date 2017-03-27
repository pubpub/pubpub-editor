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
        updateMentions('no mentions');
        return { decos: DecorationSet.empty };
      }
      var doc = editorState.doc;
      var pos = sel.$from.pos;
      var textNode = editorState.doc.nodeAt(pos);
      if (textNode) {
        var textContent = textNode.text;

        var start = sel.$from.pos;
        var end = sel.$from.pos + 2;
        var decorations = [Decoration.inline(start, end, { class: 'selection-marker' }, { inclusiveLeft: true,
          inclusiveRight: true
        })];
        var decos = DecorationSet.create(editorState.doc, decorations);

        console.log(this.spec.editorView.props);
        updateMentions('hi');
        return { decos: decos, start: start, end: end };
      }
      updateMentions('no mentions');
      return { decos: DecorationSet.empty, start: sel.$from.pos };
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
      // console.log('Got key');
      console.log(evt.type, evt.key);

      if (evt.type === 'keydown' && evt.key === 'ArrowUp') {
        var sel = view.state.selection;
        if (!sel.empty) {
          return false;
        }
        var selFrom = sel.$from.pos;
        var pluginState = this.getState(view.state);
        var start = pluginState.start,
            end = pluginState.end;

        console.log('Got', start, end, selFrom);
        if (start && selFrom >= start && selFrom <= end) {
          return true;
        }
      }
      // console.log(evt, evt.type);
    }
  }
});

exports.default = mentionsPlugin;