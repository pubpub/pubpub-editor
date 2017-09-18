'use strict';

var _prosemirrorState = require('prosemirror-state');

var keys = {
  citations: new _prosemirrorState.PluginKey('citations'),
  relativefiles: new _prosemirrorState.PluginKey('relativefiles'),
  mentions: new _prosemirrorState.PluginKey('mentions'),
  firebase: new _prosemirrorState.PluginKey('firebase'),
  track: new _prosemirrorState.PluginKey('track'),
  rebase: new _prosemirrorState.PluginKey('rebase')
};

exports.keys = keys;

exports.getPluginState = function (key, state) {
  return keys[key].getState(state);
};

exports.getPlugin = function (key, state) {
  return keys[key].get(state);
};