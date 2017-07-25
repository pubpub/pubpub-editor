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

    const clientID = String(Math.round(Math.random() * 100000));

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

}

exports.FirebaseEditor = FirebaseCollabEditor;
