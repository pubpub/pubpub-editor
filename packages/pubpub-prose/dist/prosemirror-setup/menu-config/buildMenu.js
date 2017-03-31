'use strict';

var _schema = require('../schema');

var _require = require('./menuItems'),
    wrapItem = _require.wrapItem,
    blockTypeItem = _require.blockTypeItem,
    Dropdown = _require.Dropdown,
    joinUpItem = _require.joinUpItem,
    liftItem = _require.liftItem,
    insertHorizontalRule = _require.insertHorizontalRule,
    insertPageBreak = _require.insertPageBreak,
    insertReferenceEmbed = _require.insertReferenceEmbed,
    insertLatexEmbed = _require.insertLatexEmbed,
    insertImageEmbed = _require.insertImageEmbed,
    insertVideoEmbed = _require.insertVideoEmbed,
    markItem = _require.markItem,
    linkItem = _require.linkItem,
    wrapListItem = _require.wrapListItem,
    insertTableItem = _require.insertTableItem,
    cmdItem = _require.cmdItem;

var _require2 = require('prosemirror-schema-table'),
    createTable = _require2.createTable,
    addColumnBefore = _require2.addColumnBefore,
    addColumnAfter = _require2.addColumnAfter,
    removeColumn = _require2.removeColumn,
    addRowBefore = _require2.addRowBefore,
    addRowAfter = _require2.addRowAfter,
    removeRow = _require2.removeRow;

// Helpers to create specific types of items

exports.boldItem = markItem(_schema.schema.marks.bold, { title: 'Toggle strong style', icon: 'bold' });

function buildMenuItems(schema) {
	var output = {};
	var type = void 0;
	if (type = schema.marks.sup) {
		output.supMark = markItem(type, { title: 'superscript', icon: null });
	}
	if (type = schema.marks.sub) {
		output.subMark = markItem(type, { title: 'subscript', icon: null });
	}
	if (type = schema.marks.strike) {
		output.strikeMark = markItem(type, { title: 'strikethrough', icon: null });
	}

	if (type = schema.marks.strong) {
		output.toggleStrong = markItem(type, { title: 'Toggle strong style', icon: 'bold' });
	}
	if (type = schema.marks.em) {
		output.toggleEm = markItem(type, { title: 'Toggle emphasis', icon: 'italic' });
	}
	if (type = schema.marks.code) {
		output.toggleCode = markItem(type, { title: 'Toggle code font', icon: 'code' });
	}
	if (type = schema.marks.link) {
		output.toggleLink = linkItem(type);
	}

	if (type = schema.nodes.embed) {
		output.insertImageEmbed = insertImageEmbed(type);
		output.insertVideoEmbed = insertVideoEmbed(type);
	}

	if (type = schema.nodes.reference) {
		output.insertReferenceEmbed = insertReferenceEmbed(type);
	}

	if (type = schema.nodes.equation) {
		output.insertLatexEmbed = insertLatexEmbed(type);
	}

	if (type = schema.nodes.bullet_list) output.wrapBulletList = wrapListItem(type, {
		title: 'Wrap in bullet list',
		icon: 'properties'
	});
	if (type = schema.nodes.ordered_list) output.wrapOrderedList = wrapListItem(type, {
		title: 'Wrap in ordered list',
		icon: 'numbered-list'
	});
	if (type = schema.nodes.blockquote) output.wrapBlockQuote = wrapItem(type, {
		title: 'Quote',
		icon: 'citation'
	});
	if (type = schema.nodes.paragraph) output.makeParagraph = blockTypeItem(type, {
		title: 'Normal',
		label: 'Normal'
	});
	if (type = schema.nodes.code_block) output.makeCodeBlock = blockTypeItem(type, {
		title: 'Code block',
		label: 'Code',
		icon: 'code'
	});
	if (type = schema.nodes.heading) for (var i = 1; i <= 10; i++) {
		output['makeHead' + i] = blockTypeItem(type, {
			title: 'Heading ' + i,
			label: 'Heading ' + i,
			attrs: { level: i }
		});
	}if (type = schema.nodes.horizontal_rule) {
		var hr = type;
		output.insertHorizontalRule = insertHorizontalRule(hr);
	}

	if (type = schema.nodes.page_break) {
		var pb = type;
		output.insertPageBreak = insertPageBreak(pb);
	}

	if (type = schema.nodes.table) {
		output.insertTable = insertTableItem(type);
	}
	if (type = schema.nodes.table_row) {
		output.addRowBefore = cmdItem(addRowBefore, { title: 'Add row before' });
		output.addRowAfter = cmdItem(addRowAfter, { title: 'Add row after' });
		output.removeRow = cmdItem(removeRow, { title: 'Remove row' });
		output.addColumnBefore = cmdItem(addColumnBefore, { title: 'Add column before' });
		output.addColumnAfter = cmdItem(addColumnAfter, { title: 'Add column after' });
		output.removeColumn = cmdItem(removeColumn, { title: 'Remove column' });
	}

	var cut = function cut(arr) {
		return arr.filter(function (input) {
			return input;
		});
	};

	output.textMenu = [new Dropdown(cut([output.makeParagraph, output.makeHead1, output.makeHead2, output.makeHead3, output.makeHead4]), { label: 'Normal', className: 'textMenu' })];

	output.moreinlineMenu = new Dropdown(cut([output.supMark, output.subMark, output.strikeMark]), { label: '', icon: 'style' });
	output.insertMenu = new Dropdown(cut([output.insertImageEmbed, output.insertVideoEmbed, output.insertReferenceEmbed, output.insertLatexEmbed]), { label: 'Insert', icon: 'insert' });
	output.typeMenu = new Dropdown(cut([output.makeCodeBlock, output.insertHorizontalRule]), { label: '...' });
	var tableItems = cut([output.insertTable, output.addRowBefore, output.addRowAfter, output.removeRow, output.addColumnBefore, output.addColumnAfter, output.removeColumn]);
	if (tableItems.length) {
		output.tableMenu = new Dropdown(tableItems, { label: '', icon: 'th', hideOnDisable: false });
	}

	output.inlineMenu = [[output.textMenu], cut([output.toggleStrong, output.toggleEm, output.toggleCode, output.toggleLink, output.moreinlineMenu]), [output.insertMenu]];
	output.blockMenu = [cut([output.tableMenu, output.wrapBulletList, output.wrapOrderedList, output.wrapBlockQuote, liftItem, output.typeMenu])];
	output.fullMenu = output.inlineMenu.concat(output.blockMenu);

	return output;
}

exports.buildMenuItems = buildMenuItems;