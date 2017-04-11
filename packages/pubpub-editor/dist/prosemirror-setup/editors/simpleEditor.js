'use strict';

var _schema = require('../schema');

exports.createSimpleEditor = function (place, doc) {
  var _require = require('../pubpubSetup'),
      pubpubSetup = _require.pubpubSetup;

  var _require2 = require('prosemirror-state'),
      EditorState = _require2.EditorState;

  var _require3 = require('prosemirror-view'),
      EditorView = _require3.EditorView;

  var _require4 = require("prosemirror-markdown"),
      defaultMarkdownParser = _require4.defaultMarkdownParser,
      defaultMarkdownSerializer = _require4.defaultMarkdownSerializer;

  // const {clipboardParser, clipboardSerializer} = require('./proseEditor/clipboardSerializer');

  /*
  const state = EditorState.create({
    // doc: pubSchema.nodeFromJSON(this.collab.doc.contents),
  	plugins: [pubpubSetup({schema: pubSchema})],
  });
  */


  var view = void 0;
  try {
    view = new EditorView(place, {
      state: EditorState.create({ schema: _schema.schema }),
      onAction: function onAction(action) {
        return view.updateState(view.state.applyAction(action));
      },
      spellcheck: true
    });
  } catch (err) {
    console.log('Could not create Editor!', err);
  }

  return {
    view: view,
    toJSON: function toJSON() {
      return view.state.doc.toJSON();
    },
    toMarkdown: function toMarkdown() {
      var markdown = defaultMarkdownSerializer.serialize(view.state.doc);
      return markdown;
    },
    focus: function focus() {
      view.focus();
    },
    clear: function clear() {
      var newState = EditorState.create({ schema: _schema.schema });
      view.updateState(newState);
    }
  };
};