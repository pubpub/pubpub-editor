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
- How to store in a firebase account?
- How to not store marks in steps?
*/

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

// keep a track of commits
// check if the new commit is not near the others
// otherwise, keep grouping until it happens


const trackChangesPlugin = new Plugin({
  state: {
    init(config, instance) {
      this.storedSteps = [];
      this.stepOffsets = [];
      this.unconfirmedSteps = [];
      this.transactions = {};
      this.unconfirmedMap = new Mapping();
      initialState = instance;
      return {
        deco: DecorationSet.empty, commit: null
      };
    },
    apply(transaction, state, prevEditorState, editorState) {

      return state;
    }
  },


  /*
  function isAdjacentToLastStep(transform, prevMap, done) {
    if (!prevMap) return false
    let firstMap = transform.mapping.maps[0], adjacent = false
    if (!firstMap) return true
    firstMap.forEach((start, end) => {
      done.items.forEach(item => {
        if (item.step) {
          prevMap.forEach((_start, _end, rStart, rEnd) => {
            if (start <= rEnd && end >= rStart) adjacent = true
          })
          return false
        } else {
          start = item.map.invert().map(start, -1)
          end = item.map.invert().map(end, 1)
        }
      }, done.items.length, 0)
    })
    return adjacent
  }
  */

  // adjacency commits?
  // don't worry

  addStep: function(step) {
    const unconfirmedMap = this.unconfirmedMap;
    if (unconfirmedMap.maps.length === 0) {
      unconfirmedMap.appendMap(step.getMap());
    } else {
      // how to check adjacency in a map?
      let adjacent = false;
      firstMap.forEach((start, end) => {
        done.items.forEach(item => {
          if (item.step) {
            prevMap.forEach((_start, _end, rStart, rEnd) => {
              if (start <= rEnd && end >= rStart) adjacent = true
            })
            return false
          } else {
            start = item.map.invert().map(start, -1)
            end = item.map.invert().map(end, 1)
          }
        }, done.items.length, 0)
      })
    }
  },

  appendTransaction: function (transactions, oldState, newState) {
    const firstTransaction = transactions[0];
    if (!firstTransaction) {
      return;
    }
    let transaction = firstTransaction;
  //   debugger;
    if (transaction.getMeta("backdelete") || transaction.getMeta('history$')) {
      return;
    }

    if (transaction.mapping && transaction.mapping.maps.length > 0) {
      const sel = newState.selection;
      const pos = sel.$from;

      for (const step of transaction.steps) {
        let mappedStep = step;
        let totalOffset = 0;

        for (const stepOffset of this.stepOffsets) {
          if (mappedStep.from > stepOffset.index) {
            totalOffset = totalOffset + stepOffset.size;
          }
        }

        mappedStep = mappedStep.offset(totalOffset * -1);
        this.storedSteps.push(mappedStep);
      }

      if (!pos.parent || !pos.parent.nodeType || pos.parent.nodeType.name !== 'diff') {

        let tr = newState.tr;

        const mappings = transaction.mapping.maps;

        for (const step of transaction.steps) {
          const map = step.getMap();

          if (step instanceof AddMarkStep) {
            tr = tr.addMark(step.from, step.to, schema.mark('diff_plus', {}));
            continue;
          }

          const slice = step.slice.content;

          if (slice.size === 0) {
            continue;
          }

          map.forEach((oldStart, oldEnd, newStart, newEnd) => {

            if (oldStart !== oldEnd) {
              const inverse = step.invert(oldState.doc);
              tr = tr.step(inverse);
              const slice = step.slice.content;
              const possibleInsert = tr.mapping.map(newEnd, 1);

              const insertstep = replaceStep(tr.doc, possibleInsert, possibleInsert, step.slice);
              const newOffset = { index: oldEnd, size: inverse.slice.size };
              this.stepOffsets.push(newOffset);

              tr = tr.step(insertstep);

              const insertStart = tr.mapping.map(newEnd, -1);
              const insertEnd = tr.mapping.map(newEnd, 1);

              tr = tr.addMark(oldStart, oldEnd, schema.mark('diff_minus', {}));
              tr = tr.addMark(insertStart, insertEnd, schema.mark('diff_plus', {}));

              // need to loop through and delete stuff
              /*
              let i;
              let lastRange = null;
              for (i = oldStart; i <= oldEnd; i++) {
                const incrementPos = tr.doc.resolve(oldStart);
                const incrementPos = tr.doc.resolve(oldStart);
              }
              */
              // tr = tr.addMark(oldStart, oldEnd, schema.mark('diff_minus', {}));

              tr.setMeta("backdelete", true);
            } else {
              tr = tr.addMark(newStart, newEnd, schema.mark('diff_plus', {}));
            }


          });
        }

        return tr;
      }
      return null;
    }
    return null;
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
  key: keys.track,
  props: {
    resetView: function(view) {
      console.log(this);
      view.updateState(initialState);
      let tr = view.state.tr;
      for (const step of this.storedSteps) {
        tr = tr.step(step);
      }
      tr.setMeta('backdelete', true);
      view.dispatch(tr);
    },
    getTrackedSteps: function() {
      return this.storedSteps;
    },
    handleKeyDown: function (view, event) {

      if (event.code === 'Backspace') {

        const sel = view.state.selection;
        const pos = sel.$from;
        let tr = view.state.tr;
        const beforeSel = Selection.findFrom(view.state.doc.resolve(sel.from - 1),-1, true);
        const marks = beforeSel.$from.marks();
        const hasDiff = marks.find((mark) => {
          return (mark.type.name === 'diff_plus');
        });
        if (hasDiff) {
          return false;
        }
        const deleteStep = replaceStep(tr.doc, beforeSel.from, sel.from, Slice.empty);
        const newOffset = { index: beforeSel.from, size: 1 };
        this.storedSteps.push(deleteStep);
        this.stepOffsets.push(newOffset);

        tr = tr.addMark(beforeSel.from, sel.from, schema.mark('diff_minus', {}));
        tr = tr.setSelection(beforeSel);
        tr.setMeta('backdelete', true);
        view.dispatch(tr);

        return true;
      }
    },

  }
});

export default trackChangesPlugin;
