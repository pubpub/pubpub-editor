import { AddMarkStep, ReplaceAroundStep, ReplaceStep } from 'prosemirror-transform';

import cuid from 'cuid';

const getPlugin = () => {
  return null;
}

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
  let mergedSteps = [];
  let mergingStep = null;
  for (const step of steps) {
    if (!mergingStep) {
      mergingStep = step;
    } else {
      const tryMergeStep = mergingStep.merge(step);
      if (tryMergeStep) {
        mergingStep = tryMergeStep;
      } else {
        mergedSteps.push(mergingStep);
        mergingStep = null;
      }
    }
  }
  if (mergingStep) {
    mergedSteps.push(mergingStep);
  }
  return mergedSteps;
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

    const stepMap = step.getMap();

    if(this.start === null) {
      stepMap.forEach((_start, _end, rStart, rEnd) => {
        this.start = rStart;
        this.end = rEnd;
      });
      this.steps.push(step);
      return true;
    }

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

  get uuid() {
    return this.commit.uuid;
  }

  reset = (step) => {
    const editorState = this.plugin.spec.view.state;
    const firebasePlugin = getPlugin('firebase', editorState);
    if (this.commit && firebasePlugin) {
      const mergedSteps = mergeSteps(this.commit.steps);
      const description = (mergedSteps) ? describeStep(mergedSteps[mergedSteps.length - 1]) : 'No Description';
      if (mergedSteps.length > 1) {
        console.log('Got merged steps', mergedSteps, this.commit.steps, description);
      }
      const { steps, uuid, start, end } = this.commit;
      firebasePlugin.props.commit({ description, steps, uuid, start, end });
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
    return adjacent;
  }
}


exports.CommitTracker = CommitTracker;
