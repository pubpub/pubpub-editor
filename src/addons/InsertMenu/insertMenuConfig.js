import { createTable } from 'prosemirror-schema-table';

/* -------------- */
/* Horizontal Rule */
/* -------------- */
function insertHorizontalRule(view) {
	view.dispatch(view.state.tr.replaceSelectionWith(schema.nodes.horizontal_rule.create()));
}

/* -------------- */
/* Latex Equation */
/* -------------- */
function insertLatexEquation(view) {
	const newNode = view.state.schema.nodes.equation.create({ content: '\\sum_ix^i' });
	view.dispatch(view.state.tr.replaceSelectionWith(newNode));
}

/* -------------- */
/* Table */
/* -------------- */
function insertTable(view) {
	const rows = 2;
	const cols = 2;
	view.dispatch(view.state.tr.replaceSelectionWith(createTable(schema.nodes.table, rows, cols)));
}

/* -------------- */
/* Reference */
/* -------------- */
function insertReference(view, citationData) {
	const referenceNode = view.state.schema.nodes.reference.create({ citationID: citationData.id });
	let transaction = view.state.tr.replaceSelectionWith(referenceNode);
	transaction = transaction.setMeta('createReference', citationData);
	return view.dispatch(transaction);
}

function insertFootnote(view) {
	const footnoteNode = view.state.schema.nodes.footnote.create({ content: '' });
	const transaction = view.state.tr.replaceSelectionWith(footnoteNode);
	return view.dispatch(transaction);
}

/* -------------- */
/* Embed */
/* -------------- */
function insertEmbed(view, filename, url) {
	const textnode = view.state.schema.text('Enter caption.');
	const captionNode = view.state.schema.nodes.caption.create({}, textnode);
	const embedNode = view.state.schema.nodes.embed.create(
		{
			filename,
			url,
		},
		captionNode
	);

	let transaction = view.state.tr.replaceSelectionWith(embedNode);
	transaction = transaction.setMeta('uploadedFile', { filename, url });
	view.dispatch(transaction);
}

function canUseInsertMenu(state) {
	const nodeType = state.schema.nodes.paragraph;
	const attrs = {};
	let $from = state.selection.$from
	for (let d = $from.depth; d >= 0; d--) {
		let index = $from.index(d)
		if ($from.node(d).canReplaceWith(index, index, nodeType, attrs)) return true
	}
	return false
}


function getMenuItems(view, openDialog) {

	if (!view) {
		return [];
	}

	const schema = view.state.schema;
	const menuItems = [
		{
			icon: 'pt-icon-h1',
			text: 'Insert Table',
			run: insertTable.bind(null, view),
		},
		{
			icon: 'pt-icon-h1',
			text: 'Insert Horizontal Line',
			run: insertHorizontalRule.bind(null, view),
		},
	];

	const nodes = schema.nodes;
	Object.keys(nodes).forEach((nodeName) => {
		const nodeSpec = nodes[nodeName].spec;
		if (nodeSpec.insertMenu) {
			menuItems.push({
				icon: nodeSpec.insertMenu.icon,
				text: nodeSpec.insertMenu.label,
				run: nodeSpec.insertMenu.onInsert.bind(null, view),
			})
		}
	});

	return menuItems;
}

export default getMenuItems;
exports.insertEmbed = insertEmbed;
exports.insertReference = insertReference;
exports.canUseInsertMenu = canUseInsertMenu;
