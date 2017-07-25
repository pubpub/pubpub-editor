import { CitationsPlugin, FootnotesPlugin, MentionsPlugin, RebasePlugin, RelativeFilesPlugin, SelectPlugin, TrackPlugin } from '../plugins';

import { BaseEditor } from './baseEditor';
import { schema } from '../schema';

class RichEditor extends BaseEditor {

  constructor({place, text, config, contents, props, components: { suggestComponent } = {}, handlers: { createFile, onChange, captureError, updateMentions } = {} }) {
    super();
    const {pubpubSetup} = require('../setup');
    const {markdownParser} = require("../../markdown");

    let plugins = pubpubSetup({ schema }).concat(CitationsPlugin).concat(SelectPlugin).concat(RelativeFilesPlugin).concat(MentionsPlugin).concat(FootnotesPlugin);

    if (config.trackChanges) {
      plugins = plugins.concat(TrackPlugin);
    }

    if (config.rebaseChanges) {
      plugins = plugins.concat(RebasePlugin);
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

exports.RichEditor = RichEditor;
