import { Schema } from 'prosemirror-model';
import { marks, nodes } from './baseSchema';

const appendMetaAttr = (nodesObject)=> {
	const newNodes = {};
	Object.keys(nodesObject).forEach((nodeKey)=> {
		if (nodeKey === 'text') {
			newNodes[nodeKey] = nodesObject[nodeKey];
		} else {
			newNodes[nodeKey] = {
				...nodesObject[nodeKey],
				attrs: {
					...nodesObject[nodeKey].attrs,
					trackChangesData: { default: {} },
				}
			};
		}
	});
	return newNodes;
};

export default (addonNodes, addonMarks) => {
	return new Schema({
		nodes: appendMetaAttr({ ...nodes, ...addonNodes }),
		marks: { ...marks, ...addonMarks },
		topNode: 'doc'
	});
};
