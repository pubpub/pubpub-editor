export const renderStatic = (schema, nodeArray, editorProps)=> {
	return nodeArray.map((node, index)=> {
		let children;
		if (node.content) {
			children = renderStatic(schema, node.content, editorProps);
		}
		if (node.type === 'text') {
			const marks = node.marks || [];
			children = marks.reduce((prev, curr)=> {
				const MarkComponent = schema.marks[curr.type].spec.toStatic(curr, prev);
				return MarkComponent;
			}, node.text);
		}

		const nodeWithIndex = node;
		nodeWithIndex.currIndex = index;
		const customOptions = editorProps.nodeOptions[node.type] || {};
		const mergedOptions = { ...schema.nodes[node.type].defaultOptions, ...customOptions };
		const NodeComponent = schema.nodes[node.type].spec.toStatic(nodeWithIndex, mergedOptions, false, false, editorProps, children);
		return NodeComponent;
	});
};

export const thing = 5;
