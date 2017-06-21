const { Selection } = require('prosemirror-state')
const { Node } = require('prosemirror-model')
const { Step } = require('prosemirror-transform')
const { collab, sendableSteps, receiveTransaction } = require('prosemirror-collab')
const { compressStepsLossy, compressStateJSON, uncompressStateJSON, compressSelectionJSON, uncompressSelectionJSON, compressStepJSON, uncompressStepJSON } = require('prosemirror-compress')
const TIMESTAMP = { '.sv': 'timestamp' }

export class FirebaseEditor {
  constructor({ firebaseRef, stateConfig, view: constructView, clientID: selfClientID = firebaseRef.push().key, progress = _=>_ }) {
    progress(0 / 2)
    const this_ = this
    const checkpointRef = this.checkpointRef = firebaseRef.child('checkpoint')
    const changesRef = this.changesRef = firebaseRef.child('changes')
    const selectionsRef = this.selectionsRef = firebaseRef.child('selections')
    const selfSelectionRef = this.selfSelectionRef = selectionsRef.child(selfClientID)
    selfSelectionRef.onDisconnect().remove()
    const selections = this.selections = {}
    const selfChanges = {}
    let selection = undefined

    const constructEditor = checkpointRef.once('value').then(
      function (snapshot) {
        progress(1 / 2)
        let { d, k: latestKey = -1 } = snapshot.val() || {}
        latestKey = Number(latestKey)
        const newDoc = d && Node.fromJSON(stateConfig.schema, uncompressStateJSON({ d }).doc)
        // stateConfig.plugins = (stateConfig.plugins || []).concat(collab({ clientID: selfClientID }))

        function compressedStepJSONToStep(compressedStepJSON) {
          return Step.fromJSON(stateConfig.schema, uncompressStepJSON(compressedStepJSON)) }

        function updateCollab({ docChanged, mapping }, newState) {
          if (docChanged) {
            for (let clientID in selections) {
              selections[clientID] = selections[clientID].map(newState.doc, mapping)
            }
          }

          const sendable = sendableSteps(newState)
          console.log('Got sendable steps', sendable);
          if (sendable) {
            const { steps, clientID } = sendable
            changesRef.child(latestKey + 1).transaction(
              function (existingBatchedSteps) {
                if (!existingBatchedSteps) {
                  selfChanges[latestKey + 1] = steps
                  return {
                    s: compressStepsLossy(steps).map(
                      function (step) {
                        return compressStepJSON(step.toJSON()) } ),
                    c: clientID,
                    t: TIMESTAMP,
                  }
                }
              },
              function (error, committed, { key }) {
                if (error) {
                  console.error('updateCollab', error, sendable, key)
                } else if (committed && key % 100 === 0 && key > 0) {
                  const { d } = compressStateJSON(newState.toJSON())
                  checkpointRef.set({ d, k: key, t: TIMESTAMP })
                }
              },
              false )
          }

          const selectionChanged = !newState.selection.eq(selection)
          if (selectionChanged) {
            selection = newState.selection
            selfSelectionRef.set(compressSelectionJSON(selection.toJSON()))
          }
        }

        return changesRef.startAt(null, String(latestKey + 1)).once('value').then(
          function (snapshot) {
            progress(2 / 2)
            const view = this_.view = constructView({ newDoc, updateCollab, selections })
            const editor = view.editor || view

            const changes = snapshot.val()
            if (changes) {
              const steps = []
              const stepClientIDs = []
              const placeholderClientId = '_oldClient' + Math.random()
              const keys = Object.keys(changes)
              latestKey = Math.max(...keys)
              for (let key of keys) {
                const compressedStepsJSON = changes[key].s
                steps.push(...compressedStepsJSON.map(compressedStepJSONToStep))
                stepClientIDs.push(...new Array(compressedStepsJSON.length).fill(placeholderClientId))
              }
              editor.dispatch(receiveTransaction(editor.state, steps, stepClientIDs))
            }

            function updateClientSelection(snapshot) {
              const clientID = snapshot.key
              if (clientID !== selfClientID) {
                const compressedSelection = snapshot.val()
                if (compressedSelection) {
                  try {
                    selections[clientID] = Selection.fromJSON(editor.state.doc, uncompressSelectionJSON(compressedSelection))
                  } catch (error) {
                    console.warn('updateClientSelection', error)
                  }
                } else {
                  delete selections[clientID]
                }
                editor.dispatch(editor.state.tr)
              }
            }
            selectionsRef.on('child_added', updateClientSelection)
            selectionsRef.on('child_changed', updateClientSelection)
            selectionsRef.on('child_removed', updateClientSelection)

            changesRef.startAt(null, String(latestKey + 1)).on(
              'child_added',
              function (snapshot) {
                latestKey = Number(snapshot.key)
                const { s: compressedStepsJSON, c: clientID } = snapshot.val()
                const steps = (
                  clientID === selfClientID ?
                    selfChanges[latestKey]
                  :
                    compressedStepsJSON.map(compressedStepJSONToStep) )
                const stepClientIDs = new Array(steps.length).fill(clientID)
                editor.dispatch(receiveTransaction(editor.state, steps, stepClientIDs))
                delete selfChanges[latestKey]
              } )

            return Object.assign({
              destroy: this_.destroy.bind(this_),
            }, this_)
          } )
      } )

    Object.defineProperties(this, {
      then: { value: constructEditor.then.bind(constructEditor) },
      catch: { value: constructEditor.catch.bind(constructEditor) },
    })
  }

  destroy() {
    this.catch(_=>_).then(() => {
      this.changesRef.off()
      this.selectionsRef.off()
      this.selfSelectionRef.off()
      this.selfSelectionRef.remove()
      this.view.destroy()
    })
  }
}
