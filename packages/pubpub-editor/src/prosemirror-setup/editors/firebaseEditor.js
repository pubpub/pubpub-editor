import { CitationsPlugin, FootnotesPlugin, MentionsPlugin, RelativeFilesPlugin, SelectPlugin } from '../plugins';

import { BaseEditor } from './baseEditor';
import { FirebaseEditor } from './prosemirror-firebase';
import firebase from 'firebase';
import { schema } from '../schema';

const { collab } = require('prosemirror-collab');


class FirebaseCollabEditor extends BaseEditor {

  constructor({place, text, config, contents, props, components: { suggestComponent } = {}, handlers: { createFile, onChange, captureError, updateMentions } = {} }) {
    super();
    const {pubpubSetup} = require('../setup');
    const {markdownParser} = require("../../markdown");

    let docJSON;
    if (text) {
      docJSON = markdownParser.parse(text).toJSON();
    } else {
      docJSON = contents;
    }
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
    const editingRef = firebase.database().ref("testEditor");

    const clientID = editingRef.push().key;
    const plugins = pubpubSetup({ schema }).concat(CitationsPlugin).concat(SelectPlugin).concat(RelativeFilesPlugin).concat(MentionsPlugin).concat(FootnotesPlugin).concat(collab({clientID: clientID}));;

    let view = this.create({place, contents: docJSON, config, props, plugins, components: { suggestComponent }, handlers: { createFile, onChange, captureError, updateMentions }});

    const fireView = ({ stateConfig, updateCollab, newDoc }) => {
      this.updateCollab = updateCollab;
      console.log('got new doc!', newDoc);
      if (newDoc) {
        this.setDoc(newDoc);
      }

      return view;
    };

    new FirebaseEditor({
      firebaseRef: editingRef,
      stateConfig: {
          schema,
      },
      view: fireView,
      clientID
    });

  }

  _onAction (transaction) {
		if (!this.view || !this.view.state) {
			return;
		}

    console.log('updating', transaction.mapping);
		const newState = this.view.state.apply(transaction);
		this.view.updateState(newState);
		if (transaction.docChanged) {
			if (this.view.props.onChange) {
				this.view.props.onChange();
			}
		} else if (this.view.props.onCursor) {
			this.view.props.onCursor();
		}

    this.updateCollab(transaction, newState);
    console.log('updating collab!');

	}

}

exports.FirebaseEditor = FirebaseCollabEditor;
