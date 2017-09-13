import { marks, nodes } from './baseSchema';

import { Schema } from 'prosemirror-model';
import { addListNodes } from 'prosemirror-schema-list';
import { addTableNodes } from 'prosemirror-schema-table';

const baseSchema = new Schema({
	nodes: nodes,
	marks: marks,
	topNode: 'doc'
});

const schemaNodes = baseSchema.spec.nodes;
const listSchema = addListNodes(schemaNodes, 'paragraph block*', 'block');
const tableSchema = addTableNodes(listSchema, 'paragraph block*', 'block');

// export const schema = new Schema({ nodes, marks, topNode: 'doc' });

export const createSchema = () => {
	return new Schema({ nodes: tableSchema, marks, topNode: 'doc' });
};
