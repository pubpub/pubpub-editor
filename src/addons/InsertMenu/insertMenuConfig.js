export function canUseInsertMenu(state) {
	const nodeType = state.schema.nodes.paragraph;
	const attrs = {};
	const fromObject = state.selection.$from;
	for (let d = fromObject.depth; d >= 0; d--) {
		const index = fromObject.index(d);
		console.log(index, index, nodeType, attrs)
		if (fromObject.node(d).canReplaceWith(index, index, nodeType, attrs)) { return true; }
	}
	return false;
}

export function getMenuItems(view) {
	if (!view) { return []; }

	const nodes = view.state.schema.nodes;
	const menuItems = Object.keys(nodes).filter((nodeName)=> {
		const nodeSpec = nodes[nodeName].spec;
		return !!nodeSpec.insertMenu;
	}).map((nodeName) => {
		const nodeSpec = nodes[nodeName].spec;
		return {
			icon: nodeSpec.insertMenu.icon,
			label: nodeSpec.insertMenu.label,
			run: nodeSpec.insertMenu.onInsert.bind(null, view),
		};
	}).sort((foo, bar)=> {
		if (foo.label < bar.title) { return -1; }
		if (foo.label > bar.title) { return 1; }
		return 0;
	});

	return menuItems;
}
