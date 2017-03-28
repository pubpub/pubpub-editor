import {DOMParser, DOMSerializer, Fragment, Mark, MarkType, NodeType, Schema} from 'prosemirror-model';

import {addListNodes} from 'prosemirror-schema-list';
import {addTableNodes} from 'prosemirror-schema-table';
import {schema as basicSchema} from './schemaDefinition';

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


const schemaNodes = basicSchema.spec.nodes
.addBefore('horizontal_rule', 'page_break', PageBreak)
.addBefore('horizontal_rule', 'emoji', Emoji);

const listSchema = addListNodes(schemaNodes, "paragraph block*", "block");
const tableSchema = addTableNodes(listSchema, "paragraph block*", "block");

export const schema = new Schema({
	nodes: tableSchema,
	marks: basicSchema.spec.marks.addBefore('code', 'sub', SubMark).addBefore('code', 'sup', SupMark).addBefore('code', 'strike', StrikeThroughMark),
  topNode: 'doc'
});

export const createSchema = () => {
  return new Schema({
  	nodes: tableSchema,
  	marks: basicSchema.markSpec.addBefore('code', 'sub', SubMark).addBefore('code', 'sup', SupMark).addBefore('code', 'strike', StrikeThroughMark)
  });
}

const migrateMarks = (node) => {
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
