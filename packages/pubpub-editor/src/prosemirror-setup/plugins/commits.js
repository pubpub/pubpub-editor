import { AddMarkStep, ReplaceAroundStep, ReplaceStep } from 'prosemirror-transform';

import cuid from 'cuid';
import { getPlugin } from './pluginKeys';

/*
  - better cross browser message passing?
*/

/*
Functions:
  - Keep an up to date document that actually works and error checkcs
  - Receive 'commits' from other people
  - Commits are dependent the client to add them
  - Ability to merge between
  - individual commits get uuids, store and replace by them?
*/


const mergeSteps = (steps) => {
  let mergedStep = null;
  for (const mergingStep of steps) {
    if (!mergedStep) {
      mergedStep = mergingStep;
    } else {
      mergedStep = mergedStep.merge(mergingStep);
    }
  }
  return mergedStep;
}


const describeStep = (step) => {
  let description = '';
  if (step instanceof ReplaceStep) {
    if (step.slice.size === 0) {
      // needs to be able to remake doc
      description = "Delete";
    } else {
      description = "Insert"
      const content = step.slice.content.content;
      for (const node of content) {
        description += ` ${node.textContent}`;
      }
    }

  }

  // this is for modifying attributes
  else if (step instanceof ReplaceAroundStep) {
    // Need
    console.log(step);
    let description = "Replace "
    const content = step.slice.content.content;
    for (const node of content) {
      description += ` ${node.textContent}`;
    }
    return description;
  }

  else {
    console.log(step);
  }
  return description;
}


class Commit {

  constructor(step) {
    this.start = null;
    this.end = null;
    this.uuid = cuid();
    this.steps = [];
    if (step) {
      this.add(step);
    }
  }

  add(step) {

    if(this.start === null) {
      stepMap.forEach((_start, _end, rStart, rEnd) => {
        this.start = rStart;
        this.end = rEnd;
      });
      return true;
    }

    const stepMap = step.getMap();
    this.start = stepMap.map(this.start);
    this.end = stepMap.map(this.end);

    const { start, end } = this;
    let adjacent;

    stepMap.forEach((_start, _end, rStart, rEnd) => {
      if (start <= rEnd && end >= rStart) adjacent = true
      if (adjacent) {
        if (rStart < start) {
          this.start = rStart;
        }
        if (rEnd > end) {
          this.end = rEnd;
        }
      }
    });

    if (adjacent){
      this.steps.push(step);
    }

    return adjacent;
  }
}

class CommitTracker {

  constructor(plugin) {
    this.plugin = plugin;
    this.commit = null;
  }

  reset = (step) => {
    const editorState = this.plugin.spec.editorView.state;
    const firebasePlugin = getPlugin('firebase', editorState);
    if (commit) {
      let mergedStep = mergeSteps(this.commit.steps);
      const description = (mergedStep) ? describeStep(mergedStep) : 'test';
      firebasePlugin.props.commit(description);
    }

    this.commit = new Commit(step);
  }

  add = (step) => {
    if (!this.commit) {
      this.commit = new Commit();
    }
    const adjacent = this.commit.add(step);
    if (!adjacent) {
      this.reset(step);
    }
  }
}


exports.CommitTracker = CommitTracker;
