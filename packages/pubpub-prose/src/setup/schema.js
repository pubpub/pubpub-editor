import {DOMParser, DOMSerializer, Fragment, Mark, MarkType, NodeType, Schema} from 'prosemirror-model';

import {addListNodes} from 'prosemirror-schema-list';
import {addTableNodes} from 'prosemirror-schema-table';
import {schema as basicSchema} from './schema-basic';

// ;; An inline embed node type. Has these attributes:
//
// - **`src`** (required): The slug of the pub.
// - **`className`**: An optional className for styling.
// - **`id`**: An option id for styling to linking.
// - **`align`**: inline, left, right, or full
// - **`size`**: CSS valid width
// - **`caption`**: String caption to place under the embed
// - **`data`**: Cached version/atom data. This is not serialized into markdown (in the long-term), but is kept here for fast rendering

const SubMark = {
    parseDOM: [{tag: "sub"}],
    toDOM() { return ["sub"] }
};

const SupMark = {
    parseDOM: [{tag: "sup"}],
    toDOM() { return ["sup"] }
};

const StrikeThroughMark = {
    parseDOM: [{tag: "s"}],
    toDOM() { return ["s"] }
};

const PageBreak = {
    group: "block",
    toDOM(node) { return ['div', {class: 'pagebreak'}, 'pagebreak']; }
};

const Emoji = {
  group: 'inline',
  attrs: {
    content: {default: ''},
    markup: {default: ''},
  },
	toDOM: function(node) {
		return ['span', node.attrs.content];
	},
  inline: true,
}


const schemaNodes = basicSchema.nodeSpec
.addBefore('horizontal_rule', 'page_break', PageBreak)
.addBefore('image', 'emoji', Emoji);

const listSchema = addListNodes(schemaNodes, "paragraph block*", "block");
const tableSchema = addTableNodes(listSchema, "paragraph block*", "block");

export const schema = new Schema({
	nodes: tableSchema,
	marks: basicSchema.markSpec.addBefore('code', 'sub', SubMark).addBefore('code', 'sup', SupMark).addBefore('code', 'strike', StrikeThroughMark),
  topNode: 'article'
});

export const createSchema = () => {
  return new Schema({
  	nodes: tableSchema,
  	marks: basicSchema.markSpec.addBefore('code', 'sub', SubMark).addBefore('code', 'sup', SupMark).addBefore('code', 'strike', StrikeThroughMark)
  });
}


const EmbedType = schema.nodes.embed;

exports.Embed = EmbedType;


const migrateMarks = (node) => {
  // console.log('Node', node);
  if (!node) {
    return null;
  }
	if (node.content) {
		for (const subNode of node.content) {
			migrateMarks(subNode);
		}
	}
	if (node.marks) {
		node.marks = node.marks.map((mark) => {
			if (!mark._) {
				return mark;
			}
			return {
				type: mark._,
				/*
				attrs: {


				}
				*/
			}
		});
	}
	if (node.slice) {
		migrateMarks(node.slice);
	}
};

exports.migrateMarks = migrateMarks;


const migrateDiffs = (diffs) => {
	for (const diff of diffs) {
		migrateMarks(diff);
	}
};

exports.migrateDiffs = migrateDiffs;
