import { CitationsPlugin, FootnotesPlugin, MentionsPlugin, RelativeFilesPlugin, SelectPlugin, TrackPlugin } from '../plugins';

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
    const { editorKey, firebaseConfig } = config;

    let plugins = pubpubSetup({ schema })
    .concat(CitationsPlugin).concat(SelectPlugin).concat(RelativeFilesPlugin)
    .concat(MentionsPlugin)
    .concat(FirebasePlugin({selfClientID: clientID, editorKey, firebaseConfig, updateCommits: config.updateCommits}))
    .concat(collab({clientID: clientID}));

    if (config.trackChanges) {
      plugins = plugins.concat(TrackPlugin);
    }


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
