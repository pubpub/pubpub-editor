import { AddMarkStep, canJoin, insertPoint, joinPoint, replaceStep } from 'prosemirror-transform';
import {Decoration, DecorationSet} from "prosemirror-view";
import { Fragment, NodeRange, Slice } from 'prosemirror-model';

import { Plugin } from 'prosemirror-state';
import { keys } from './pluginKeys';
import { schema } from '../schema';

const { Selection } = require('prosemirror-state')
const { Node } = require('prosemirror-model')
const { Step, findWrapping, Mapping } = require('prosemirror-transform')

/*
  - Start from original doc
  - every deletion needs to be replayed?
  - store an original state?\

  - how to store these set of steps?
  - how to store decorations?


  - how to group steps as commits?



  if you only store deletions in a map, then inevitably it will be removeD?

  instead store deletions to remove after a certain map?

  e.g. store at POS 34, remove 4. at pos 40, remove 5

  // could work!!!

How to represent deleted items? Can't use widgets because of removal
*/


let initialState = null;

// need to store an array of steps that recreate the original document
// need to store mappings that remove additions


const rebasePlugin = new Plugin({
  state: {
    init(config, instance) {
      this.storedSteps = [];
      initialState = instance;
      return {};
    },
    apply(transaction, state, prevEditorState, editorState) {

      if (transaction.getMeta("backdelete") || transaction.getMeta('history$')) {
        return state;
      }

      if (transaction.mapping && transaction.mapping.maps.length > 0) {
        for (const step of transaction.steps) {
          this.storedSteps.push(step);
        }
      }

      return state;
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
  key: keys.rebase,
  props: {
    rebaseSteps: function(view, rebaseSteps) {
      const storedSteps = this.storedSteps;
      // view.updateState(initialState);
      const docMapping = new Mapping();

      for (const step of storedSteps) {
        docMapping.appendMap(step.getMap());
      }

      let tr = view.state.tr;
      for (const step of rebaseSteps) {
        const mappedStep = step.map(docMapping);
        tr = tr.step(mappedStep);
      }
      tr.setMeta('backdelete', true);
      tr.setMeta('rebase');
      view.dispatch(tr);
    },

  }
});

export default rebasePlugin;
