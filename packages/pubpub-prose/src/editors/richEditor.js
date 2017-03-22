import { CitationsPlugin, RelativeFilesPlugin, SelectPlugin } from '../plugins';

import { BaseEditor } from './baseEditor';
import { schema } from '../setup';

class RichEditor extends BaseEditor {

  constructor({place, text, contents, components: { suggestComponent } = {}, handlers: { createFile } = {} }) {
    super();
    const {pubpubSetup} = require('../setup');
    const {markdownParser} = require("../markdown");

    const plugins = pubpubSetup({ schema }).concat(CitationsPlugin).concat(SelectPlugin).concat(RelativeFilesPlugin);
    let docJSON;
    if (text) {
      docJSON = markdownParser.parse(text).toJSON();
    } else {
      docJSON = contents;
    }
    this.create({place, contents: docJSON, plugins, components: { suggestComponent }, handlers: { createFile }});
  }
}

exports.RichEditor = RichEditor;
