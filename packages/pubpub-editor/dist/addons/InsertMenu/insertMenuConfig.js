'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _prosemirrorSchemaTable = require('prosemirror-schema-table');

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
	var newNode = view.state.schema.nodes.equation.create({ content: '\\sum_ix^i' });
	view.dispatch(view.state.tr.replaceSelectionWith(newNode));
}

/* -------------- */
/* Table */
/* -------------- */
function insertTable(view) {
	var rows = 2;
	var cols = 2;
	view.dispatch(view.state.tr.replaceSelectionWith((0, _prosemirrorSchemaTable.createTable)(schema.nodes.table, rows, cols)));
}

/* -------------- */
/* Reference */
/* -------------- */
function insertReference(view, citationData) {
	var referenceNode = view.state.schema.nodes.reference.create({ citationID: citationData.id });
	var transaction = view.state.tr.replaceSelectionWith(referenceNode);
	transaction = transaction.setMeta('createReference', citationData);
	return view.dispatch(transaction);
}

function insertFootnote(view) {
	var footnoteNode = view.state.schema.nodes.footnote.create({ content: '' });
	var transaction = view.state.tr.replaceSelectionWith(footnoteNode);
	return view.dispatch(transaction);
}

/* -------------- */
/* Embed */
/* -------------- */
function insertEmbed(view, filename, url) {
	var textnode = view.state.schema.text('Enter caption.');
	var captionNode = view.state.schema.nodes.caption.create({}, textnode);
	var embedNode = view.state.schema.nodes.embed.create({
		filename: filename,
		url: url
	}, captionNode);

	var transaction = view.state.tr.replaceSelectionWith(embedNode);
	transaction = transaction.setMeta('uploadedFile', { filename: filename, url: url });
	view.dispatch(transaction);
}

function canUseInsertMenu(view) {
	var state = view.state;
	var nodeType = state.schema.nodes.paragraph;
	var attrs = {};
	var $from = state.selection.$from;
	for (var d = $from.depth; d >= 0; d--) {
		var index = $from.index(d);
		if ($from.node(d).canReplaceWith(index, index, nodeType, attrs)) return true;
	}
	return false;
}

function getMenuItems(view, openDialog) {

	if (!view) {
		return [];
	}

	var menuItems = [{
		icon: 'pt-icon-h1',
		// component: <li>
		// 	<label htmlFor={'upload-media-input'} className="pt-menu-item">
		// 		Upload Media
		// 		<input id={'upload-media-input'} type="file" onChange={onFileSelect} style={{ position: 'fixed', top: '-1000px' }} />
		// 	</label>
		// </li>,
		text: 'Upload Files',
		run: function run() {
			openDialog('files', insertEmbed.bind(null, view));
		}
	}, {
		icon: 'pt-icon-h1',
		text: 'Insert Table',
		run: insertTable.bind(null, view)
	}, {
		icon: 'pt-icon-h1',
		text: 'Insert Equation',
		run: insertLatexEquation.bind(null, view)
	}, {
		icon: 'pt-icon-h1',
		text: 'Insert Horizontal Line',
		run: insertHorizontalRule.bind(null, view)
	}, {
		icon: 'pt-icon-h1',
		text: 'Insert Footnote',
		run: insertFootnote.bind(null, view)
	}, {
		icon: 'pt-icon-h1',
		text: 'Add References',
		run: function run() {
			openDialog('references', insertReference.bind(null, view));
		}
	}];

	return menuItems;
}

exports.default = getMenuItems;

exports.insertEmbed = insertEmbed;
exports.insertReference = insertReference;
exports.canUseInsertMenu = canUseInsertMenu;