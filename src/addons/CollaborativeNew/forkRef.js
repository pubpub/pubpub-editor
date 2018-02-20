/*

class ForkRef extends DocumentRef {



  commit = ({ description, uuid, steps, start, end }) => {

    const commitSteps =  {
      s: compressStepsLossy(steps).map(
        function (step) {
          return compressStepJSON(step.toJSON()) } ),
      c: selfClientID,
      m: {},
      t: TIMESTAMP,
    };
    return editorRef.child('currentCommit').once('value').then((snapshot) => {
      const currentCommit = snapshot.val();
      const commitID = currentCommit.commitID;
      const commit = {
        description,
        clientID: '',
        steps: [commitSteps],
        uuid: uuid,
        merged: false,
        commitKey: latestKey,
        start,
        end
      };
      const newCommitID = commitID + 1;
      return editorRef.child(`commits/${commitID}`).set(commit).then(() => {
        editorRef.child('currentCommit').set({ commitID: newCommitID });
        const { d } = compressStateJSON(editorView.state.toJSON());
        checkpointRef.set({ d, k: latestKey, t: TIMESTAMP });
      });
    });
  }

  // return a function that take an index and rebases on it??
  rebaseByCommit(forkID) {
    const forkRef = firebaseDb.ref(forkID);
    const editorChangesRef = firebaseDb.ref(editorKey).child("changes");

    return Promise.all([
      getFirebaseValue({ref: forkRef, child: "forkData"}),
      getFirebaseValue({ref: forkRef, child: "checkpoint"}),
    ]).then(([forkData, checkpoint]) => {
      const { merged, parent, forkedKey } = forkData;
      const { d } = checkpoint;
      const checkpointDoc = uncompressStateJSON({ d }).doc;

      return getFirebaseValue({ref: forkRef, child: "commits"})
      .then((commitVals) => {
        const commits = Object.values(commitVals || {});

        // needs to fetch new steps on every commit!
        const rebaseCommitHandler = (index) => {
          const singleCommit = commits[index];
          const prevCommits = commits.slice(0, index);
          return getSteps({ view: editorView, changesRef: editorChangesRef, key: forkedKey }).then((newSteps) => {
            rebaseCommit({ commit: singleCommit, allCommits: prevCommits, view: editorView, newSteps, changesRef, clientID: selfClientID, latestKey, selfChanges });
            return setFirebaseValue({ ref: forkRef, child: `commits/${index}/merged`, data: true });
          });
        }

        return { rebaseCommitHandler, commits, checkpointDoc };
      })
    });
  },

}

*/
