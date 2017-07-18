import { AddMarkStep, canJoin, insertPoint, joinPoint, replaceStep } from 'prosemirror-transform';
import {Decoration, DecorationSet} from "prosemirror-view";
import { NodeRange, Slice } from 'prosemirror-model';

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

*/

/*
How to represent deleted items? Can't use widgets because of removal
*/

/*
const createReference = (citationData, state, engine) => {
	const citationID = citationData.id;
	const newNode = schema.nodes.citation.create({data: citationData, citationID });
	const citationsNode = findNodesWithIndex(state.doc, 'citations');
	const pos = citationsNode[0].index + 1;

	// tries to find the closest place to insert this note
	const newPoint = insertPoint(state.doc, pos, schema.nodes.citation, {data: citationData});
	let tr = state.tr.insert(newPoint, newNode);
	tr.setMeta('createdReference', citationID);
	engine.addCitation(citationData);
	return tr;
}


const trackPlugin = new Plugin({
  state: {
    init(_, instance) {
      return new TrackState([new Span(0, instance.doc.content.size, null)], [], [], [])
    },
    applyAction(action, tracked, previousState, newState) {
      if (action.type == "transform")
        return tracked.applyTransform(action.transform)
      if (action.type == "commit")
        return tracked.applyCommit(action.message, action.time)
      else
        return tracked
    }
  }
});
*/

const storedSteps = [];
const docMap = new Mapping();
let initialState = null;

// need to store an array of steps that recreate the original document
// need to store mappings that remove additions


const trackChangesPlugin = new Plugin({
  state: {
    init(config, instance) {
      console.log(instance.doc);
      initialState = instance;
      return {
        deco: DecorationSet.empty, commit: null
      };
    },
    apply(transaction, state, prevEditorState, editorState) {

      return state;

      /*
      if (action.type == "highlightCommit") {
        let tState = trackPlugin.getState(state);
        const editingCommit = tState.commits.length;
        let decos = tState.blameMap
            .filter(span => span.commit !== null)
            .map(span => {
              let decorationClass = `blame-marker commit-id-${span.commit}`;
              if (span.commit !== action.commit) {
                decorationClass += ' invisible';
              } else {
                decorationClass += ' highlight';
              }
              if (span.commit === editingCommit) {
                decorationClass += ' editing';
              }
              return Decoration.inline(span.from, span.to, {class: decorationClass}, {inclusiveLeft: true, inclusiveRight: true});
            })
        return {deco: DecorationSet.create(state.doc, decos), commit: action.commit}
      }
      else
      */

      /*
      if (action.type == "transform" && prev.commit) {
        console.log('got previous committt');
        return {deco: prev.deco.map(action.transform.mapping, action.transform.doc), commit: prev.commit}
      }
      else if (action.type === 'commit' || action.type === 'transform' || action.type === 'clearHighlight') {
        let tState = trackPlugin.getState(state)
        const editingCommit = tState.commits.length;
        let decos = tState.blameMap
            .filter(span => span.commit !== null)
            .map(span => {
              let decorationClass = `blame-marker commit-id-${span.commit}`;
              if (span.commit === editingCommit) {
                decorationClass += ' editing';
              }
              return Decoration.inline(span.from, span.to, {class: decorationClass}, {inclusiveLeft: true, inclusiveRight: true});
            })
        return {deco: DecorationSet.create(state.doc, decos), commit: action.commit};
      }
      return val;
      */

      /*
      if (action.type == "highlightCommit" && prev.commit != action.commit) {
        let tState = trackPlugin.getState(state)
        let decos = tState.blameMap
            .filter(span => tState.commits[span.commit] == action.commit)
            .map(span => Decoration.inline(span.from, span.to, {class: "blame-marker"}))
        return {deco: DecorationSet.create(state.doc, decos), commit: action.commit}
      } else if (action.type == "clearHighlight" && prev.commit == action.commit) {
        return {deco: DecorationSet.empty, commit: null}
      } else if (action.type == "transform" && prev.commit) {
        return {deco: prev.deco.map(action.transform.mapping, action.transform.doc), commit: prev.commit}
      } else {
        return prev
      }
      */
    }
  },

  // need to prevent backspace button
  appendTransaction: function (transactions, oldState, newState) {
    const firstTransaction = transactions[0];
    if (!firstTransaction) {
      console.log('appending pls');
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
        const mappedStep = step.map(docMap);
        if (mappedStep) {
          storedSteps.push(mappedStep);
        } else {
          console.log('COULD NOT STEP', mappedStep);
        }
        console.log(mappedStep);
        // storedSteps.push(step);
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
            console.log('got nothing!');
            continue;
          }

          map.forEach((oldStart, oldEnd, newStart, newEnd) => {

            if (oldStart !== oldEnd) {
              const inverse = step.invert(oldState.doc);
              tr = tr.step(inverse);
              const slice = step.slice.content;
              const possibleInsert = tr.mapping.map(newEnd, 1);
              // const newMapping = tr.mapping.map(possibleInsert - 1));
              const insertstep = replaceStep(tr.doc, possibleInsert,possibleInsert, step.slice);

              // console.log('INVERSE STEP', inverse.getMap());
              const steppedMap = step.getMap();
              steppedMap.ranges[2] = 0;
              console.log(steppedMap);
              docMap.appendMap(steppedMap);
              tr = tr.step(insertstep);
              // docMap.appendMap(insertstep.getMap());

              console.log(inverse.slice.content);
              // console.log(insertstep.getMap().map(newStart - 1, -1));
              // console.log(insertstep.getMap().map(newEnd + 1, 1));
              // const deleteStep = replaceStep(tr.doc, possibleInsert,possibleInsert, step.slice);

              // tr = tr.insert(possibleInsert, slice);
              const insertStart = tr.mapping.map(newEnd, -1);
              const insertEnd = tr.mapping.map(newEnd, 1);
              // need to check actual changes?

              tr = tr.addMark(oldStart, oldEnd, schema.mark('diff_minus', {}));
              tr = tr.addMark(insertStart, insertEnd, schema.mark('diff_plus', {}));

              // Should it be

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

              //c tr.addStoredMark(schema.mark('diff_plus', {}));
              tr = tr.addMark(newStart, newEnd, schema.mark('diff_plus', {}));
              /*
              const range = new NodeRange(tr.doc.resolve(newStart), tr.doc.resolve(newEnd), tr.doc.resolve(newStart).depth);
              const wrappings = findWrapping(range, schema.nodes.diff, {});
              tr = tr.wrap(range, wrappings);
              */
            }


            /*
            const range = new NodeRange(tr.doc.resolve(newStart), tr.doc.resolve(newEnd), tr.doc.resolve(newStart).depth);
            const wrappings = findWrapping(range, schema.nodes.diff, {});
            tr = tr.wrap(range, wrappings);
            if (oldStart !== oldEnd) {
              // const inverse = step.invert(oldState.doc);
              // const slice = inverse.slice.content;
              const slice = oldState.doc.slice(oldStart, oldEnd).content;
              const possibleInsert = tr.mapping.map(newStart, -1);
              // const actualInsert = insertPoint(tr.doc, possibleInsert)
              // console.log(possibleInsert, newEnd, slice);
              tr = tr.insert(possibleInsert, slice);

              console.log(canJoin(tr.doc, possibleInsert));
              console.log(canJoin(tr.doc, tr.mapping.map(possibleInsert - 1)));
              console.log(joinPoint(tr.doc, tr.mapping.map(possibleInsert - 1)));

              //tr = tr.join(tr.mapping.map(possibleInsert + 1));
              tr.setMeta("backdelete", true);
            }
            */
          });
        }

        return tr;
        /*
        for (const mapping of transaction.transaction.mapping) {
          mapping.forEach((oldStart, oldEnd, newStart, newEnd) => {

          });
        }

        wrap(range: NodeRange, wrappers: [{type: NodeType, attrs: ?Object}]) → this

        let tr = newState.tr.insert(newPoint, newNode);
        tr.setMeta('createdReference', citationID);
        */
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
      view.updateState(initialState);
      let tr = view.state.tr;
      const hasMapped = false;
      const stepMap = new Mapping();
      console.log(docMap);
      // stepMap.appendMapping(docMap);
      for (const step of storedSteps) {
      //   let passStep = step.map(stepMap);
      //   const mappedStep = step.map(docMap);
        // console.log('applying step', step, mappedStep);

        tr = tr.step(step);
        // stepMap.appendMap(step.getMap());
        // tr.setMeta('backdelete', true);
        //view.dispatch(tr);
        // tr = view.state.tr;
      }

      console.log('got stored!', storedSteps);
      tr.setMeta('backdelete', true);
      view.dispatch(tr);
    },
    handleKeyDown: function (view, event) {
      if (event.code === 'Backspace') {

        const sel = view.state.selection;
        const pos = sel.$from;
        let tr = view.state.tr;
        // const beforePos = view.state.doc.resolve(pos.before(pos.depth + 1));
        const beforeSel = Selection.findFrom(view.state.doc.resolve(sel.from - 1),-1, true);
        // tr.setSelection(Selection.near(tr.doc.resolve(selPos), 1));
        // view.dispatch(tr);
        // return true;

        // does it have to be a node wrapper?

        const marks = beforeSel.$from.marks();

        const hasDiff = marks.find((mark) => {
          return (mark.type.name === 'diff_plus');
        });


        if (hasDiff) {
          return false;
        }

        tr = tr.addMark(beforeSel.from, sel.from, schema.mark('diff_minus', {}));
        tr = tr.setSelection(beforeSel);

        /*
        const range = new NodeRange(beforeSel.$from, pos, pos.depth);
        const wrappings = findWrapping(range, schema.nodes.diff, {type: 'minus'});

        tr = tr.wrap(range, wrappings);
        tr = tr.setSelection(beforeSel);
        */
        tr.setMeta('backdelete', true);
        view.dispatch(tr);

        return true;
      }
    },

  }
});

export default trackChangesPlugin;
