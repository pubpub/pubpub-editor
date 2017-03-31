'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _prosemirrorSchemaTable = require('prosemirror-schema-table');

var _prosemirrorSetup = require('../prosemirror-setup');

// import { toggleMark, lift, joinUp, selectParentNode, wrapIn, setBlockType } from 'prosemirror-commands';
function getMenuItems(editor, openDialog) {

	/* Horizontal Rule */
	/* -------------- */
	function insertHorizontalRule() {
		editor.view.dispatch(editor.view.state.tr.replaceSelectionWith(_prosemirrorSetup.schema.nodes.horizontal_rule.create()));
	}

	/* Latex Equation */
	/* -------------- */
	function insertLatexEquation() {
		var newNode = _prosemirrorSetup.schema.nodes.equation.create({ content: '\\sum_ix^i' });
		editor.view.dispatch(editor.view.state.tr.replaceSelectionWith(newNode));
	}

	/* -------------- */
	/* Table */
	/* -------------- */
	function insertTable() {
		var rows = 2;
		var cols = 2;
		editor.view.dispatch(editor.view.state.tr.replaceSelectionWith((0, _prosemirrorSchemaTable.createTable)(_prosemirrorSetup.schema.nodes.table, rows, cols)));
	}

	/* Reference */
	/* -------------- */
	function insertReference(citationObject) {
		editor.view.dispatch(editor.view.state.tr.setMeta('createCitation', citationObject));
	}

	/* Embed */
	/* -------------- */
	function insertEmbed(filename) {
		// const filename = 'test.jpg'; // Should be passed in
		var url = 'http://cdn3-www.dogtime.com/assets/uploads/gallery/30-impossibly-cute-puppies/impossibly-cute-puppy-5.jpg'; // Should be passed in
		console.log('filename is', filename);
		var textnode = _prosemirrorSetup.schema.text('Enter caption.');
		var captionNode = _prosemirrorSetup.schema.nodes.caption.create({}, textnode);
		var embedNode = _prosemirrorSetup.schema.nodes.embed.create({
			filename: filename,
			align: 'full',
			size: '50%'
		}, captionNode);

		var transaction = editor.view.state.tr.replaceSelectionWith(embedNode);
		transaction = transaction.setMeta('uploadedFile', { filename: filename, url: url });
		editor.view.dispatch(transaction);
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
			openDialog('files', insertEmbed);
		}
	}, {
		icon: 'pt-icon-h1',
		text: 'Insert Table',
		run: insertTable
	}, {
		icon: 'pt-icon-h1',
		text: 'Insert Equation',
		run: insertLatexEquation
	}, {
		icon: 'pt-icon-h1',
		text: 'Insert Horizontal Line',
		run: insertHorizontalRule
	}, {
		icon: 'pt-icon-h1',
		text: 'Add References',
		run: function run() {
			openDialog('references', insertReference);
		}
	}];

	return menuItems;
}

exports.default = getMenuItems;