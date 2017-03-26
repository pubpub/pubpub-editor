import {AbstractEditor} from './richEditor';
import {Plugin} from 'prosemirror-state';
import {schema as pubSchema} from '../schema';

const {Decoration, DecorationSet} = require("prosemirror-view")
const {Mapping} = require("prosemirror-transform")

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


// Add class to number review
// positionally anchor elements
const highlightPlugin = new Plugin({
  state: {
    init() { return {deco: DecorationSet.empty, commit: null} },
    applyAction(action, val, prev, state) {

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
      else if (action.type == "transform" && prev.commit) {
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
  props: {
    decorations(state) {
      if (state && this.getState(state)) {
        return this.getState(state).deco;
      }
      return null;

    },
    handleTextInput(view, from, to, text) {
      // console.log('got text!', arguments);
      const {Transform} = require('prosemirror-transform');
      if (from !== to) {
        const doc = view.state.doc;
        const textNode = pubSchema.text(text);
        const newT = view.state.tr.replaceWith(to, to, textNode);
        const action = {
          type: 'transform',
          transform: newT
        };
        const markDeleteAction = {
          type: 'markDelete',
          to: to,
          from: from,
        };
        view.props.onAction(action);
        view.props.onAction(markDeleteAction);
        return true;
      }
    }
  }
})

class Span {
  constructor(from, to, commit) {
    this.from = from; this.to = to; this.commit = commit
  }
}

class Commit {
  constructor(message, time, steps, maps, hidden, id) {
    this.message = message;
    this.time = time;
    this.steps = steps;
    this.maps = maps;
    this.hidden = hidden;
    this.id = id;
    this.unsaved = false;
  }
}

class UnsavedCommit extends Commit {
  constructor(id) {
    super('',new Date(), [], [], false, id);
    this.unsaved = true;
  }
}

class TrackState {
  constructor(blameMap, commits, uncommittedSteps, uncommittedMaps) {
    this.blameMap = blameMap
    this.commits = commits
    this.uncommittedSteps = uncommittedSteps
    this.uncommittedMaps = uncommittedMaps
  }

  applyTransform(transform) {
    // console.log(transform);
    console.log(transform.steps);
    let inverted = transform.steps.map((step, i) => step.invert(transform.docs[i]))
    const newBlameMap = updateBlameMap(this.blameMap, transform, this.commits.length);
    return new TrackState(newBlameMap,
                          this.commits,
                          this.uncommittedSteps.concat(inverted),
                          this.uncommittedMaps.concat(transform.mapping.maps))
  }

  applyCommit(message, time) {
    if (this.uncommittedSteps.length == 0) return this
    let commit = new Commit(message, time, this.uncommittedSteps, this.uncommittedMaps, false, this.commits.length)
    return new TrackState(this.blameMap, this.commits.concat(commit), [], [])
  }
}


function updateBlameMap(map, transform, id) {
  // for each existing part of the blame map
  // take the to and from and map it through the transforms mapping
  // if the from is less than the to, then the step still exists and you push it to the span
  let result = [], mapping = transform.mapping
  for (let i = 0; i < map.length; i++) {
    let span = map[i]
    let from = mapping.map(span.from, 1), to = mapping.map(span.to, -1)
    if (from < to) result.push(new Span(from, to, span.commit))
  }

  // take each new step and insert it into the blame
  for (let i = 0; i < mapping.maps.length; i++) {
    let map = mapping.maps[i], after = mapping.slice(i + 1)
    map.forEach((_s, _e, start, end) => {
      insertIntoBlameMap(result, after.map(start, 1), after.map(end, -1), id)
    })
  }

  return result
}

function insertIntoBlameMap(map, from, to, commit) {
  if (from >= to) return
  let pos = 0, next
  for (; pos < map.length; pos++) {
    next = map[pos]
    if (next.commit == commit) {
      if (next.to >= from) break
    } else if (next.to > from) { // Different commit, not before
      if (next.from < from) { // Sticks out to the left (loop below will handle right side)
        let left = new Span(next.from, from, next.commit)
        if (next.to > to) map.splice(pos++, 0, left)
        else map[pos++] = left
      }
      break
    }
  }

  while (next = map[pos]) {
    if (next.commit == commit) {
      if (next.from > to) break
      from = Math.min(from, next.from)
      to = Math.max(to, next.to)
      map.splice(pos, 1)
    } else {
      if (next.from >= to) break
      if (next.to > to) {
        map[pos] = new Span(to, next.to, next.commit)
        break
      } else {
        map.splice(pos, 1)
      }
    }
  }

  map.splice(pos, 0, new Span(from, to, commit))
}



let lastRendered = null


function revertCommit(commitId, state) {
  let tState = trackPlugin.getState(state)
  let found = tState.commits[commitId];
  if (!found) return
  const commit = found;
  let actions = [];

  if (tState.uncommittedSteps.length) return alert("Commit your changes first!")

  let remap = new Mapping(tState.commits.slice(found).reduce((maps, c) => maps.concat(c.maps), []))
  let tr = state.tr
  for (let i = commit.steps.length - 1; i >= 0; i--) {
    let remapped = commit.steps[i].map(remap.slice(i + 1))
    let result = remapped && tr.maybeStep(remapped)
    if (result && result.doc) remap.appendMap(remapped.getMap(), i)
  }
  if (tr.steps.length) {
    console.log('removing action', tr.steps)
    actions.push(tr.action());
    // actions.push(commitAction(`Revert '${commit.message}'`));
  } else {
    console.log('could not revert!');
  }
  return actions;
}


function findInBlameMap(pos, state) {
  let map = trackPlugin.getState(state).blameMap
  for (let i = 0; i < map.length; i++)
    if (map[i].to >= pos && map[i].commit != null)
      return map[i].commit
}

/*
document.querySelector("#blame").addEventListener("mousedown", e => {
  e.preventDefault()
  let pos = e.target.getBoundingClientRect()
  let commitID = findInBlameMap(state.selection.head, state)
  let commit = commitID != null && trackPlugin.getState(state).commits[commitID]
  let node = crel("div", {class: "blame-info"},
                  commitID != null ? ["It was: ", crel("strong", null, commit ? commit.message : "Uncommitted")]
                  : "No commit found")
  node.style.right = (document.body.clientWidth - pos.right) + "px"
  node.style.top = (pos.bottom + 2) + "px"
  document.body.appendChild(node)
  setTimeout(() => document.body.removeChild(node), 2000)
})
*/

class ReviewEditor extends AbstractEditor {

  constructor({place, text, contents, otherEditor, renderCommits}) {
    super();
    this._onAction = this._onAction.bind(this);
    this.otherEditor = otherEditor;
    this.renderCommits = renderCommits;
    this.trackPlugin = trackPlugin;
    this.highlightPlugin = highlightPlugin;
    const {pubpubSetup} = require('../pubpubSetup');
    const {markdownParser} = require("../markdownParser");

    const plugins = pubpubSetup({schema: pubSchema});
    let docJSON;
    if (text) {
      docJSON = markdownParser.parse(text).toJSON();
    } else {
      docJSON = contents;
    }
    this.create({place, contents: docJSON, plugins});
  }

  create({place, contents, plugins}) {

    const diffPlugins = plugins.concat(trackPlugin, highlightPlugin);
    super.create({place, contents, plugins: diffPlugins});

  }

  createCommit = (msg) => {
    const commitAction = {type: "commit", message: msg, time: new Date};
    this._onAction(commitAction);
  }

  highlightCommit = (commitId) => {
    const commitAction = {type: "highlightCommit", commit: commitId};
    this._onAction(commitAction);
  }

  clearHighlight = (commitId) => {
    const commitAction = {type: "clearHighlight", commit: commitId};
    this._onAction(commitAction);
  }

  revertCommit = (commitId) => {
    const actions = revertCommit(commitId, this.view.state);
    for (const action of actions) {
      this._onAction(action);
    }
  }

  _onAction(action) {
    super._onAction(action);
    const state = this.view.state;
    let curState = this.trackPlugin.getState(state);
    const commits = curState.commits.slice(0);
    let editingId = null;
    if (curState.uncommittedSteps.length > 0) {
      editingId = curState.commits.length;
    }
    this.renderCommits(commits, editingId);
  }


}

exports.ReviewEditor = ReviewEditor;
