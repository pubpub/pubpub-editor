/*
Functions:
  - Keep an up to date document that actually works and error checkcs
  - Receive 'commits' from other people
  - Commits are dependent the client to add them
  - Ability to merge between
  - individual commits get uuids, store and replace by them?
*/

/*
import { AddMarkStep, ReplaceAroundStep, ReplaceStep } from 'prosemirror-transform';

import cuid from 'cuid';
import { getPlugin } from './pluginKeys';




class DocumentRef {

  constructor({firebaseRef, child, view}) {
    this.ref = firebaseRef.child(child);
    this.view view;
    this.plugin = plugin;
    this.commit = null;

    function compressedStepJSONToStep(compressedStepJSON) {
      return Step.fromJSON(view.state.schema, uncompressStepJSON(compressedStepJSON)) }

  }

  getCommits() {
    return this.ref.child('commits').on('value', function(commitVals) {
      const commits = commitVals.val() || {};
      return Object.values(commits);
    });
  }

  loadCheckpoint() {

  }

  // get latest steps of merge, and merge that in
  commit() {

  }

}

class TrackedDocumentRef extends DocumentRef {


}


exports.CommitTracker = CommitTracker;
*/
"use strict";