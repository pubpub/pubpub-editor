import { Schema } from 'prosemirror-model';
import { marks, nodes } from './baseSchema';

const baseSchema = new Schema({
	nodes: nodes,
	marks: marks,
	topNode: 'doc'
});

const schemaNodes = baseSchema.spec.nodes;
// const tableSchema = addTableNodes(listSchema, 'paragraph block*', 'block');
export default (addonNodes, addonMarks) => {
	return new Schema({
		nodes: schemaNodes.append(addonNodes),
		marks: { ...marks, ...addonMarks },
		topNode: 'doc'
	});
};
