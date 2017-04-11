'use strict';

var _prosemirrorSetup = require('../prosemirror-setup');

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
	icon: 'pt-icon-h1',
	text: "Add Column Before",
	run: addColumnBefore,
	isActive: function isActive(state) {
		return addColumnBefore(state);
	}
}, {
	icon: 'pt-icon-h1',
	text: "Remove Column",
	run: removeColumn,
	isActive: function isActive(state) {
		return removeColumn(state);
	}
}, {
	icon: 'pt-icon-h1',
	text: "Add Column After",
	run: addColumnAfter,
	isActive: function isActive(state) {
		return addColumnAfter(state);
	}
}];

exports.menuItems = menuItems;
exports.inTable = inTable;