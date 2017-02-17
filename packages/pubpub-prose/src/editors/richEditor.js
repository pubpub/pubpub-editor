import { CitationsPlugin, SelectPlugin } from '../plugins';

import { BaseEditor } from './baseEditor';
import { schema } from '../setup';

class RichEditor extends BaseEditor {

  constructor({place, text, contents, handlers: { createFile } }) {
    super();
    const {pubpubSetup} = require('../setup');
    const {markdownParser} = require("../markdown");

    const plugins = pubpubSetup({ schema }).concat(CitationsPlugin).concat(SelectPlugin);
    let docJSON;
    if (text) {
      docJSON = markdownParser.parse(text).toJSON();
    } else {
      docJSON = contents;
    }
    this.create({place, contents: docJSON, plugins, handlers: { createFile }});
  }
}

exports.RichEditor = RichEditor;
