
/*

  Firebase Plugin:
    => Passes info to track changes pluginKeys
    => Passes info to rebase pluginKeys
    => syncs with itself

  Editors:
    - open interfaces into plugins

    - functional closure

*/

const callPlugin(name, func) {
  return getPlugin(name, editorView.state).props[func];
}

// this vs closure?
// has to be a closure, but a well-defined closure?
// what is 'this'?

this.trackPlugin = getPlugin(name, editorView.state).props || null;

if (this.trackPlugin) {
  trackPlugin.callFunction();
}


callPlugin('track','getPlugin')()

const FirePlugin = getPlugin('track', editorView.state).props.getPlugin();

getPlugin('track', editorView.state).props.getPlugin();

const sendable = sendableSteps(newState);

const updateRebasedSteps = () => {
  const sendableTracks = trackPlugin.getSendableSteps();
  if (sendableTracks) {
    this.props.storeRebaseSteps(sendableTracks);
  }
}


function bindProps(obj, self, target) {
  for (let prop in obj) {
    let val = obj[prop]
    if (val instanceof Function) val = val.bind(self)
    else if (prop == "handleDOMEvents") val = bindProps(val, self, {})
    target[prop] = val
  }
  return target
}


export class Plugin {
  // :: (PluginSpec)
  // Create a plugin.
  constructor(spec) {
    // :: EditorProps
    // The props exported by this plugin.
    this.props = {}
    if (spec.props) bindProps(spec.props, this, this.props)
    // :: Object
    // The plugin's configuration object.
    spec.view = spec.view.bind(this);
    this.spec = spec
    this.key = spec.key ? spec.key.key : createKey("plugin")
  }

  // :: (EditorState) → any
  // Get the state field for this plugin.
  getState(state) { return state[this.key] }
}

class BasePlugin extends Plugin {

  constructor(spec) {
    this.spec.view = updateView;
  }

  plugin(name) {
    return getPlugin(name, this.view.state);
  }

  updateView(_view) => {
    this.view = _view;
  }
}

/*
  this.exports exposes a function on the base editor class?
  -- talk to Travis tomorrow about how to structure that sort of exposure
  -- what is a es6 decorator?
  -- learn more about generators, async, awaits, etc
  -- make an exportable function?
*/

class FirebasePlugin extends Plugin {

  constructor(spec) {
    super(spec);
    this.exports = {

    }
    this.trackPlugin = this.plugin('track').props;
  }

  plugin(name) {
    // we basically always address these as our props
    return getPlugin(name, this.view.state).props;
  }

  updateView(_view) => {
    this.view = _view;
  }
}


class Plugin {


  constructor() {

  }

  init = (config, instance) => {

  }

  apply = () => {

  }

  setView = (_view) => {
    this.view = _View;
  }

  build = () => {


    return new Plugin({
      state: {
        init: this.init,
        apply: this.apply,
      },
      view: this.setView,
      props: {
        getProps: () => {
          return this.
        }
      }
    });

  }

}
