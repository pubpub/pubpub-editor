import {AbstractEditor} from './richEditor';
import {DiffPlugin} from '../plugins';
import murmurhash from 'murmurhash';
import {schema as pubSchema} from '../schema';

// show added in green and removed in reduce
// hovering on one, highlights both changed
// clicking on one, accepts changes into the document




// use state.write in markdown serializer to build a diff map?

class DiffEditor extends AbstractEditor {

  constructor({place, text, contents}) {
    super();
    const {pubpubSetup} = require('../pubpubSetup');
    const {markdownParser} = require("../markdownParser");

    const plugins = pubpubSetup({schema: pubSchema});
    let docJSON;
    if (text) {
      docJSON = markdownParser.parse(text).toJSON();
    } else {
      docJSON = contents;
    }
    this.create({place, contents: docJSON, plugins});
  }

	linkEditor(linkedEditor, {showAsAdditions}) {
    const {pubpubSetup} = require('../pubpubSetup');
    const plugins = pubpubSetup({schema: pubSchema});
		const diffPlugins = plugins.concat(DiffPlugin);
		super.reconfigure(diffPlugins, {linkedEditor, originalEditor: this, showAsAdditions});
	}

	linkedTransform() {
		const action = {type: 'linkedTransform'};
		this._onAction(action);
	}

  patchDiff() {

  }

  // if newState exists, then use that instead of the default state
  // this is useful if called by an action to get the top most diff
	getDiffStr(newState) {
		let doc;
    const diffMap = {};
    if (!newState) {
      doc = this.view.state.doc;
    } else {
      doc = newState.doc;
    }
		const nodeSize = doc.nodeSize;
		let diffStr = "";

    // non-leaf tokens have a start and end size
		for (let nodeIndex = 0; nodeIndex < nodeSize - 1; nodeIndex++) {
			const child = doc.nodeAt(nodeIndex);
      // console.log(child);
			if (child) {
				let diffText = '';
				if (child.isText) {
					diffText = '"' + child.text + '"';
          // diffText = child.text
          if (child.text.length !== child.nodeSize) {
            console.log('WOAH THIS IS AN ISSUE');
          }
          for (var j = 0; j < child.nodeSize; j++) {
            diffMap[diffStr.length + j + 1 ] = nodeIndex + j;
          }
					nodeIndex += child.nodeSize - 1;
				}
        // can we generalize this to any block?
        else if (child.type.name === 'block_embed') {
          const attrsStr = JSON.stringify(child.attrs);
          // diffText = 'embed' + attrsStr + ' ';
          const attrHash = murmurhash.v3(attrsStr);
          diffText = `embed${attrHash} `;
          for (var j = 0; j < diffText.length - 1; j++) {
            diffMap[diffStr.length + j] = {type: 'embed', index: nodeIndex};
          }
        } else {
					diffText = child.type.name.charAt(0);
          diffMap[diffStr.length] = nodeIndex;
          // node attrs
				}
				diffStr += diffText;
			} else {
				diffStr += " ";
			}

		}
    console.log(diffStr);
    // console.log(diffMap);
		return {diffStr, diffMap};
	}


	/*
  create({place, contents, plugins}) {

    const otherEditor = this.otherEditor;
    // const diffPlugins = plugins.concat(diffPlugin);

    super.create({place, contents, plugins: plugins, config: {otherEditor: 'test'}});
  }
	*/


}

exports.DiffEditor = DiffEditor;
