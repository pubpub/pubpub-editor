import { createTable } from 'prosemirror-schema-table';
import { schema } from '../prosemirror-setup';

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
	const newNode = schema.nodes.equation.create({ content: '\\sum_ix^i' });
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
	// view.props.
	const referenceNode = schema.nodes.reference.create({ citationID: citationData.id });
	let transaction = view.state.tr.replaceSelectionWith(referenceNode);
	transaction = transaction.setMeta('createReference', citationData);
	return view.dispatch(transaction);
}

/* -------------- */
/* Embed */
/* -------------- */
function insertEmbed(view, filename, url) {
	// const filename = 'test.jpg'; // Should be passed in
	console.log('INSERTING', filename, url);
	// const url = 'http://cdn3-www.dogtime.com/assets/uploads/gallery/30-impossibly-cute-puppies/impossibly-cute-puppy-5.jpg';
	console.log('filename is', filename)
	const textnode = schema.text('Enter caption.');
	const captionNode = schema.nodes.caption.create({}, textnode);
	const embedNode = schema.nodes.embed.create(
		{
			filename,
			align: 'full',
			size: '50%',
		},
		captionNode
	);

	let transaction = view.state.tr.replaceSelectionWith(embedNode);
	transaction = transaction.setMeta('uploadedFile', { filename, url });
	view.dispatch(transaction);
}

function canUseInsertMenu(view) {
	const state = view.state;
	const nodeType = schema.nodes.paragraph;
	const attrs = {};
	let $from = state.selection.$from
	for (let d = $from.depth; d >= 0; d--) {
		let index = $from.index(d)
		if ($from.node(d).canReplaceWith(index, index, nodeType, attrs)) return true
	}
	return false
}


function getMenuItems(editor, openDialog) {

	if (!editor) {
		return [];
	}

	const menuItems = [
		{
			icon: 'pt-icon-h1',
			// component: <li>
			// 	<label htmlFor={'upload-media-input'} className="pt-menu-item">
			// 		Upload Media
			// 		<input id={'upload-media-input'} type="file" onChange={onFileSelect} style={{ position: 'fixed', top: '-1000px' }} />
			// 	</label>
			// </li>,
			text: 'Upload Files',
			run: ()=> { openDialog('files', insertEmbed.bind(null, editor.view)); },
		},
		{
			icon: 'pt-icon-h1',
			text: 'Insert Table',
			run: insertTable.bind(null, editor.view),
		},
		{
			icon: 'pt-icon-h1',
			text: 'Insert Equation',
			run: insertLatexEquation.bind(null, editor.view),
		},
		{
			icon: 'pt-icon-h1',
			text: 'Insert Horizontal Line',
			run: insertHorizontalRule.bind(null, editor.view),
		},
		{
			icon: 'pt-icon-h1',
			text: 'Add References',
			run: ()=> { openDialog('references', insertReference.bind(null, editor.view)); },
		},

	];


	return menuItems;
}

export default getMenuItems;
exports.insertEmbed = insertEmbed;
exports.insertReference = insertReference;
exports.canUseInsertMenu = canUseInsertMenu;
