// import { toggleMark, lift, joinUp, selectParentNode, wrapIn, setBlockType } from 'prosemirror-commands';
import { createTable } from 'prosemirror-schema-table';

import { schema } from '../prosemirror-setup';

function getMenuItems(editor) {

	/* Horizontal Rule */
	/* -------------- */
	function insertHorizontalRule() {
		editor.view.dispatch(editor.view.state.tr.replaceSelectionWith(schema.nodes.horizontal_rule.create()));
	}
	/* -------------- */
	/* -------------- */

	/* Latex Equation */
	/* -------------- */
	function insertLatexEquation() {
		const newNode = schema.nodes.equation.create({ content: '\\sum_ix^i' });
		editor.view.dispatch(editor.view.state.tr.replaceSelectionWith(newNode));
	}
	/* -------------- */
	/* -------------- */

	/* Table */
	/* -------------- */
	function insertTable() {
		// const newNode = schema.nodes.equation.create({ content: '\\sum_ix^i' });
		// editor.view.dispatch(editor.view.state.tr.replaceSelectionWith(newNode));
		const rows = 2;
		const cols = 2;
		editor.view.dispatch(editor.view.state.tr.replaceSelectionWith(createTable(schema.nodes.table, rows, cols)));
	}
	/* -------------- */
	/* -------------- */

	const menuItems = [
		{
			icon: 'pt-icon-h1',
			text: 'Upload Media',
			run: ()=>{},
		},
		{
			icon: 'pt-icon-h1',
			text: 'Insert Table',
			run: insertTable,
		},
		{
			icon: 'pt-icon-h1',
			text: 'Insert Equation',
			run: insertLatexEquation,
		},
		{
			icon: 'pt-icon-h1',
			text: 'Insert Horizontal Line',
			run: insertHorizontalRule,
		},
		{
			icon: 'pt-icon-h1',
			text: 'Add References',
			run: ()=>{},
		},
		
	];


	return menuItems;
}

export default getMenuItems;
