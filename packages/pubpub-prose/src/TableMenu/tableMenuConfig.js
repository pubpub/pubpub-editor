const { createTable, addColumnBefore, addColumnAfter, removeColumn, addRowBefore, addRowAfter, removeRow } = require('prosemirror-schema-table');

import { schema } from '../prosemirror-setup';

const inTable = function findRow($pos, pred) {
  for (let d = $pos.depth; d > 0; d--)
    if ($pos.node(d).type.spec.tableRow && (!pred || pred(d))) return d
  return -1
}

const menuItems = [
	{
		icon: 'pt-icon-remove-column',
		text: "Remove Column",
		run: removeColumn,
		isActive(state) { return removeColumn(state) }
	},
	{
		icon: 'pt-icon-exclude-row',
		text: "Remove Row",
		run: removeRow,
		isActive(state) { return removeRow(state) }
	},
	/*
	{
		icon: 'pt-icon-add-column-left',
		text: "Add Column Before",
		run: addColumnBefore,
		isActive(state) { return addColumnBefore(state) }
	},
	*/
	{
		icon: 'pt-icon-add-column-right',
		text: "Add Column",
		run: addColumnAfter,
		isActive(state) { return addColumnAfter(state) }
	},
	{
		icon: 'pt-icon-add-row-bottom',
		text: "Add Row",
		run: addRowAfter,
		isActive(state) { return addRowAfter(state) }
	},

];


exports.menuItems = menuItems;
exports.inTable = inTable;
