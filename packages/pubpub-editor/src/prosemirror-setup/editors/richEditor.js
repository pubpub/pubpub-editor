import { CitationsPlugin, MentionsPlugin, RelativeFilesPlugin, SelectPlugin } from '../plugins';

import { BaseEditor } from './baseEditor';
import { schema } from '../schema';

class RichEditor extends BaseEditor {

  constructor({place, text, config, contents, props, components: { suggestComponent } = {}, handlers: { createFile, onChange, captureError, updateMentions } = {} }) {
    super();
    const {pubpubSetup} = require('../setup');
    const {markdownParser} = require("../../markdown");

    const plugins = pubpubSetup({ schema }).concat(CitationsPlugin).concat(SelectPlugin).concat(RelativeFilesPlugin).concat(MentionsPlugin);
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
