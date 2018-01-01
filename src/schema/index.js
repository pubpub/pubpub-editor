import { Schema } from 'prosemirror-model';
// import { addListNodes } from 'prosemirror-schema-list';
// import { addTableNodes } from 'prosemirror-schema-table';
import { marks, nodes } from './baseSchema';

const baseSchema = new Schema({
	nodes: nodes,
	marks: marks,
	topNode: 'doc'
});

const schemaNodes = baseSchema.spec.nodes;
// const listSchema = addListNodes(schemaNodes, 'paragraph block*', 'block');
// const tableSchema = addTableNodes(listSchema, 'paragraph block*', 'block');
// console.log(schemaNodes, listSchema);
export default (addonNodes, addonMarks) => {
	return new Schema({
		// nodes: listSchema.append(addonNodes),
		nodes: schemaNodes.append(addonNodes),
		marks: { ...marks, ...addonMarks },
		topNode: 'doc'
	});
};
