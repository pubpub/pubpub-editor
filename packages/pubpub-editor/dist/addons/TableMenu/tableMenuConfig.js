'use strict';

var _require = require('prosemirror-schema-table'),
    createTable = _require.createTable,
    addColumnBefore = _require.addColumnBefore,
    addColumnAfter = _require.addColumnAfter,
    removeColumn = _require.removeColumn,
    addRowBefore = _require.addRowBefore,
    addRowAfter = _require.addRowAfter,
    removeRow = _require.removeRow;

var inTable = function findRow($pos, pred) {
	for (var d = $pos.depth; d > 0; d--) {
		if ($pos.node(d).type.spec.tableRow && (!pred || pred(d))) return d;
	}return -1;
};

var menuItems = [{
	icon: 'pt-icon-remove-column',
	text: "Remove Column",
	run: removeColumn,
	isActive: function isActive(state) {
		return removeColumn(state);
	}
}, {
	icon: 'pt-icon-exclude-row',
	text: "Remove Row",
	run: removeRow,
	isActive: function isActive(state) {
		return removeRow(state);
	}
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
	isActive: function isActive(state) {
		return addColumnAfter(state);
	}
}, {
	icon: 'pt-icon-add-row-bottom',
	text: "Add Row",
	run: addRowAfter,
	isActive: function isActive(state) {
		return addRowAfter(state);
	}
}];

exports.menuItems = menuItems;
exports.inTable = inTable;