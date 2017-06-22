import { CitationsPlugin, FootnotesPlugin, MentionsPlugin, RelativeFilesPlugin, SelectPlugin } from '../plugins';

import { BaseEditor } from './baseEditor';
import FirebasePlugin from '../plugins/firebasePlugin';
import firebase from 'firebase';
import {getPlugin} from '../plugins';
import { schema } from '../schema';

const { collab } = require('prosemirror-collab');


class FirebaseCollabEditor extends BaseEditor {

  constructor({place, text, config, contents, props, components: { suggestComponent } = {}, handlers: { createFile, onChange, captureError, updateMentions } = {} }) {
    super();

    const {pubpubSetup} = require('../setup');
    const {markdownParser} = require("../../markdown");
    const collabEditing = require('prosemirror-collab').collab;

    const clientID = Math.round(Math.random() * 100000);

    const plugins = pubpubSetup({ schema })
    .concat(CitationsPlugin).concat(SelectPlugin).concat(RelativeFilesPlugin)
    .concat(MentionsPlugin).concat(FootnotesPlugin)
    .concat(FirebasePlugin({selfClientID: clientID}))
    .concat(collab({clientID: clientID}));

    let docJSON;
    if (text) {
      docJSON = markdownParser.parse(text).toJSON();
    } else {
      docJSON = contents;
    }
    this.create({place, contents: docJSON, config, props, plugins, components: { suggestComponent }, handlers: { createFile, onChange, captureError, updateMentions }});


  }

  _onAction (transaction) {
		if (!this.view || !this.view.state) {
			return;
		}

		const newState = this.view.state.apply(transaction);
		this.view.updateState(newState);
		if (transaction.docChanged) {
			if (this.view.props.onChange) {
				this.view.props.onChange();
			}
		} else if (this.view.props.onCursor) {
			this.view.props.onCursor();
		}

    let firebasePlugin;
		if (firebasePlugin = getPlugin('firebase', this.view.state)) {
			return firebasePlugin.props.updateCollab(transaction, newState);
		}
	}

}

exports.FirebaseEditor = FirebaseCollabEditor;
