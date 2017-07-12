import {Decoration, DecorationSet} from "prosemirror-view";
import { NodeRange, Slice } from 'prosemirror-model';
import { canJoin, insertPoint, joinPoint, replaceStep } from 'prosemirror-transform';

import { Plugin } from 'prosemirror-state';
import { keys } from './pluginKeys';
import { schema } from '../schema';

const { Selection } = require('prosemirror-state')
const { Node } = require('prosemirror-model')
const { Step, findWrapping } = require('prosemirror-transform')


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

const trackChangesPlugin = new Plugin({
  state: {
    init() { return {deco: DecorationSet.empty, commit: null} },
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

  filterTransaction(transaction, editorState) {

    // Never changes cursor!

    return true;


    if (!transaction.docChanged) {
      return true;
    }

    if (transaction.steps) {
      console.log(transaction);
      return false;
      console.log(transaction.steps);
      for (const step of transaction.steps) {
        if (step.slice.content.content.length === 0) {
          console.log('STOP FILTERING');
          return false;
        }
      }
      return true;
    } else {
      return false;
    }

    let filter = false;
    for (const step of transaction.steps) {
      console.log('trying step')
      console.log(step);
      if (step.slice.content.content.length === 0) {
        filter = true;
      }
    }
    // console.log(transaction);
    /*
    if (filter) {
      console.log('blehh');
      transaction.steps = [];
    }
    */
    console.log('trying to filter', filter, transaction);
    return false;
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
    if (transaction.getMeta("backdelete")) {
      return;
    }
    if (transaction.mapping && transaction.mapping.maps.length > 0) {
      const sel = newState.selection;
      const pos = sel.$from;
      if (!pos.parent || !pos.parent.nodeType || pos.parent.nodeType.name !== 'diff') {

        let tr = newState.tr;

        /*
        for (const step of transaction.steps) {
  				if (step.slice.content.content.length === 0) {
  				  const newStep = step.invert(oldState.doc);
  				  tr.step(newStep);
  				}
  			}
        */

        const mappings = transaction.mapping.maps;

        console.log(transaction.steps);

        for (const step of transaction.steps) {
          const map = step.getMap();
          map.forEach((oldStart, oldEnd, newStart, newEnd) => {

            if (oldStart !== oldEnd) {
              const inverse = step.invert(oldState.doc);
              tr = tr.step(inverse);
              const slice = step.slice.content;
              const possibleInsert = tr.mapping.map(newEnd, 1);
              // const newMapping = tr.mapping.map(possibleInsert - 1));
              tr = tr.insert(possibleInsert, slice);
              const insertStart = tr.mapping.map(newEnd, -1);
              const insertEnd = tr.mapping.map(newEnd, 1);
              console.log(insertStart, insertEnd, newStart, newEnd);
              const range = new NodeRange(tr.doc.resolve(insertStart), tr.doc.resolve(insertEnd), tr.doc.resolve(insertStart).depth);
              const wrappings = findWrapping(range, schema.nodes.diff, {});
              tr = tr.wrap(range, wrappings);


              const newoldStart = tr.mapping.map(oldStart, 1);
              const newoldEnd = tr.mapping.map(oldEnd, 1);
              const oldRange = new NodeRange(tr.doc.resolve(oldStart), tr.doc.resolve(oldEnd), tr.doc.resolve(oldStart).depth);
              const oldWrappings = findWrapping(oldRange, schema.nodes.diff, {type: 'minus'});
              tr = tr.wrap(oldRange, oldWrappings);

              /*
              console.log(canJoin(tr.doc, possibleInsert));
              console.log(canJoin(tr.doc, tr.mapping.map(possibleInsert - 1)));
              console.log(joinPoint(tr.doc, tr.mapping.map(possibleInsert - 1)));
              */
              tr.setMeta("backdelete", true);
            } else {
              const range = new NodeRange(tr.doc.resolve(newStart), tr.doc.resolve(newEnd), tr.doc.resolve(newStart).depth);
              const wrappings = findWrapping(range, schema.nodes.diff, {});
              tr = tr.wrap(range, wrappings);
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
  props: {
    handleKeyDown: function (view, event) {
      if (event.code === 'Backspace') {

        const sel = view.state.selection;
        const pos = sel.$from;
        let tr = view.state.tr;
        // const beforePos = view.state.doc.resolve(pos.before(pos.depth + 1));
        const beforeSel = Selection.findFrom(view.state.doc.resolve(sel.from - 1), -1, true);
        // tr.setSelection(Selection.near(tr.doc.resolve(selPos), 1));
        // view.dispatch(tr);
        // return true;

        // does it have to be a node wrapper?

        const range = new NodeRange(beforeSel.$from, pos, pos.depth);
        const wrappings = findWrapping(range, schema.nodes.diff, {type: 'minus'});

        tr = tr.wrap(range, wrappings);
        tr = tr.setSelection(beforeSel);
        tr.setMeta('backdelete', true);
        view.dispatch(tr);

        return true;
      }
    },

  }
});

export default trackChangesPlugin;
