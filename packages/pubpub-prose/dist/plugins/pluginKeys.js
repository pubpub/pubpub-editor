'use strict';

var _prosemirrorState = require('prosemirror-state');

var keys = {
  citations: new _prosemirrorState.PluginKey('citations'),
  relativefiles: new _prosemirrorState.PluginKey('relativefiles')
};

exports.keys = keys;

exports.getPluginState = function (key, state) {
  return keys[key].getState(state);
};

exports.getPlugin = function (key, state) {
  return keys[key].get(state);
};