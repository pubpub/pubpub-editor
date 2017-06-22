import { Plugin } from 'prosemirror-state';
import { Slice } from 'prosemirror-model';
import { getPluginState } from '../plugins';
import { insertPoint } from 'prosemirror-transform';
import { keys } from './pluginKeys';
import { schema } from '../schema';

const { Selection } = require('prosemirror-state')
const { Node } = require('prosemirror-model')
const { Step } = require('prosemirror-transform')
const { collab, sendableSteps, receiveTransaction } = require('prosemirror-collab')
const { compressStepsLossy, compressStateJSON, uncompressStateJSON, compressSelectionJSON, uncompressSelectionJSON, compressStepJSON, uncompressStepJSON } = require('prosemirror-compress')
const TIMESTAMP = { '.sv': 'timestamp' }


const { DecorationSet, Decoration } = require('prosemirror-view');

const FireBasePlugin = ({clientID}) => {

  const collabEditing = require('prosemirror-collab').collab;
  const firebaseConfig = {
    apiKey: "AIzaSyBpE1sz_-JqtcIm2P4bw4aoMEzwGITfk0U",
    authDomain: "pubpub-rich.firebaseapp.com",
    databaseURL: "https://pubpub-rich.firebaseio.com",
    projectId: "pubpub-rich",
    storageBucket: "pubpub-rich.appspot.com",
    messagingSenderId: "543714905893"
  };
  const firebaseApp = firebase.initializeApp(firebaseConfig);
  const db = firebase.database(firebaseApp);
  const firebaseRef = firebase.database().ref("testEditor");

  const checkpointRef = this.checkpointRef = firebaseRef.child('checkpoint');
  const changesRef = this.changesRef = firebaseRef.child('changes');
  const selectionsRef = this.selectionsRef = firebaseRef.child('selections');
  const selfSelectionRef = this.selfSelectionRef = selectionsRef.child(selfClientID);
  selfSelectionRef.onDisconnect().remove();
  const selections = this.selections = {};
  const selfChanges = {};
  let selection = undefined;


  return new Plugin({
  	state: {
  		init(config, instance) {
  			const set = createDecorations(instance.doc, DecorationSet.empty);
  			return {
  				decos: set,
  			};
  		},
  		apply(transaction, state, prevEditorState, editorState) {

  			/*
  			if (transaction.getMeta('docReset')) {
  				const newSet = createAllCitations(state.engine, editorState.doc, state.decos);
  				return {decos: newSet, engine: state.engine};
  			}
  			*/
  			let set = state.decos;

  			if (transaction.mapping || transaction.getMeta('history$')) {
  				const blueSet = createDecorations(editorState.doc, state.decos);
  				return { decos: blueSet };
  			}

  			return { decos: set };
  		}
  	},


  	props: {
  		decorations(state) {
  			if (state && this.getState(state) && this.getState(state).decos) {
  				return this.getState(state).decos;
  			}
  			return null;
  		},
  	},
  });

}



export default FireBasePlugin;
