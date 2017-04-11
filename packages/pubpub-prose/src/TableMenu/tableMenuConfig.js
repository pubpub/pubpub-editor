const { createTable, addColumnBefore, addColumnAfter, removeColumn, addRowBefore, addRowAfter, removeRow } = require('prosemirror-schema-table');

import { schema } from '../prosemirror-setup';

const inTable = function findRow($pos, pred) {
  for (let d = $pos.depth; d > 0; d--)
    if ($pos.node(d).type.spec.tableRow && (!pred || pred(d))) return d
  return -1
}

const menuItems = [
	{
		icon: 'pt-icon-h1',
		text: "Add Column Before",
		run: addColumnBefore,
		isActive(state) { return addColumnBefore(state) }
	},
	{
		icon: 'pt-icon-h1',
		text: "Remove Column",
		run: removeColumn,
		isActive(state) { return removeColumn(state) }
	},

	{
		icon: 'pt-icon-h1',
		text: "Add Column After",
		run: addColumnAfter,
		isActive(state) { return addColumnAfter(state) }
	},
];


exports.menuItems = menuItems;
exports.inTable = inTable;
