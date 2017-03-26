"use strict";

var _schema = require("./schema");

var _require = require("./menuItems"),
    wrapItem = _require.wrapItem,
    blockTypeItem = _require.blockTypeItem,
    Dropdown = _require.Dropdown,
    DropdownSubmenu = _require.DropdownSubmenu,
    joinUpItem = _require.joinUpItem,
    liftItem = _require.liftItem,
    selectParentNodeItem = _require.selectParentNodeItem,
    undoItem = _require.undoItem,
    redoItem = _require.redoItem,
    MenuItem = _require.MenuItem;

var _require2 = require("prosemirror-schema-table"),
    createTable = _require2.createTable,
    addColumnBefore = _require2.addColumnBefore,
    addColumnAfter = _require2.addColumnAfter,
    removeColumn = _require2.removeColumn,
    addRowBefore = _require2.addRowBefore,
    addRowAfter = _require2.addRowAfter,
    removeRow = _require2.removeRow;

var _require3 = require("prosemirror-commands"),
    toggleMark = _require3.toggleMark;

var _require4 = require("prosemirror-schema-list"),
    wrapInList = _require4.wrapInList;

// Helpers to create specific types of items

function buildMenuItems(schema) {
  var r = {},
      type = void 0;
  if (type = schema.marks.sup) r.supMark = markItem(type, { title: "superscript", icon: null });
  if (type = schema.marks.sub) r.subMark = markItem(type, { title: "subscript", icon: null });
  if (type = schema.marks.strike) r.strikeMark = markItem(type, { title: "strikethrough", icon: null });

  if (type = schema.marks.strong) r.toggleStrong = markItem(type, { title: "Toggle strong style", icon: "bold" });
  if (type = schema.marks.em) r.toggleEm = markItem(type, { title: "Toggle emphasis", icon: "italic" });
  if (type = schema.marks.code) r.toggleCode = markItem(type, { title: "Toggle code font", icon: "code" });
  if (type = schema.marks.link) r.toggleLink = linkItem(type);

  if (type = schema.nodes.embed) {
    r.insertImageEmbed = insertImageEmbed(type);
    r.insertVideoEmbed = insertVideoEmbed(type);
  }

  if (type = schema.nodes.reference) {
    r.insertReferenceEmbed = insertReferenceEmbed(type);
  }

  if (type = schema.nodes.equation) {
    r.insertLatexEmbed = insertLatexEmbed(type);
  }

  if (type = schema.nodes.bullet_list) r.wrapBulletList = wrapListItem(type, {
    title: "Wrap in bullet list",
    icon: "properties"
  });
  if (type = schema.nodes.ordered_list) r.wrapOrderedList = wrapListItem(type, {
    title: "Wrap in ordered list",
    icon: "numbered-list"
  });
  if (type = schema.nodes.blockquote) r.wrapBlockQuote = wrapItem(type, {
    title: "Quote",
    icon: "citation"
  });
  if (type = schema.nodes.paragraph) r.makeParagraph = blockTypeItem(type, {
    title: "Normal",
    label: "Normal"
  });
  if (type = schema.nodes.code_block) r.makeCodeBlock = blockTypeItem(type, {
    title: "Code block",
    label: "Code",
    icon: "code"
  });
  if (type = schema.nodes.heading) for (var i = 1; i <= 10; i++) {
    r["makeHead" + i] = blockTypeItem(type, {
      title: "Heading " + i,
      label: "Heading " + i,
      attrs: { level: i }
    });
  }if (type = schema.nodes.horizontal_rule) {
    (function () {
      var hr = type;
      r.insertHorizontalRule = new MenuItem({
        title: "Insert horizontal rule",
        label: "Horizontal rule",
        icon: "small-minus",
        select: function select(state) {
          return canInsert(state, hr);
        },
        run: function run(state, onAction) {
          onAction(state.tr.replaceSelection(hr.create()));
        }
      });
    })();
  }

  if (type = schema.nodes.page_break) {
    (function () {
      var pb = type;
      r.insertPageBreak = new MenuItem({
        title: "Insert page break",
        label: "Page break",
        icon: "vertical-distribution",
        select: function select(state) {
          return canInsert(state, pb);
        },
        run: function run(state, onAction) {
          onAction(state.tr.replaceSelection(pb.create()));
        }
      });
    })();
  }

  if (type = schema.nodes.table) r.insertTable = insertTableItem(type);
  if (type = schema.nodes.table_row) {
    r.addRowBefore = cmdItem(addRowBefore, { title: "Add row before" });
    r.addRowAfter = cmdItem(addRowAfter, { title: "Add row after" });
    r.removeRow = cmdItem(removeRow, { title: "Remove row" });
    r.addColumnBefore = cmdItem(addColumnBefore, { title: "Add column before" });
    r.addColumnAfter = cmdItem(addColumnAfter, { title: "Add column after" });
    r.removeColumn = cmdItem(removeColumn, { title: "Remove column" });
  }

  var cut = function cut(arr) {
    return arr.filter(function (x) {
      return x;
    });
  };

  r.textMenu = [new Dropdown(cut([r.makeParagraph, r.makeHead1, r.makeHead2, r.makeHead3, r.makeHead4]), { label: "Normal", className: "textMenu" })];

  r.moreinlineMenu = new Dropdown(cut([r.supMark, r.subMark, r.strikeMark]), { label: "", icon: "style" });
  r.insertMenu = new Dropdown(cut([r.insertImageEmbed, r.insertVideoEmbed, r.insertReferenceEmbed, r.insertLatexEmbed]), { label: "Insert", icon: "insert" });
  r.typeMenu = new Dropdown(cut([r.makeCodeBlock, r.insertPageBreak]), { label: "..." });
  var tableItems = cut([r.insertTable, r.addRowBefore, r.addRowAfter, r.removeRow, r.addColumnBefore, r.addColumnAfter, r.removeColumn]);
  if (tableItems.length) r.tableMenu = new Dropdown(tableItems, { label: "", icon: "th", hideOnDisable: false });

  r.inlineMenu = [[r.textMenu], cut([r.toggleStrong, r.toggleEm, r.toggleCode, r.toggleLink, r.moreinlineMenu]), [r.insertMenu]];
  r.blockMenu = [cut([r.tableMenu, r.wrapBulletList, r.wrapOrderedList, r.wrapBlockQuote, liftItem, r.typeMenu])];
  r.fullMenu = r.inlineMenu.concat(r.blockMenu);

  return r;
}
exports.buildMenuItems = buildMenuItems;