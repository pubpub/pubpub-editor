/*
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

*/
"use strict";