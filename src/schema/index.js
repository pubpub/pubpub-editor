import { Schema } from 'prosemirror-model';
import { marks, nodes } from './baseSchema';

const baseSchema = new Schema({
	nodes: nodes,
	marks: marks,
	topNode: 'doc'
});

const schemaNodes = baseSchema.spec.nodes;
export default (addonNodes, addonMarks) => {
	return new Schema({
		nodes: schemaNodes.append(addonNodes),
		marks: { ...marks, ...addonMarks },
		topNode: 'doc'
	});
};
