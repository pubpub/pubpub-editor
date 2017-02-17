import { PluginKey } from 'prosemirror-state';

const keys = {
  citations: new PluginKey('citations'),
  relativefiles: new PluginKey('relativefiles')
};

exports.keys = keys;

exports.getPluginState = (key, state) => {
  return keys[key].getState(state);
};

exports.getPlugin = (key, state) => {
  return keys[key].get(state);
};
