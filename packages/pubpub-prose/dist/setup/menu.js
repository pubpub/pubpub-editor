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

var _require5 = require("./prompt"),
    TextField = _require5.TextField,
    openPrompt = _require5.openPrompt;

// Helpers to create specific types of items

function canInsert(state, nodeType, attrs) {
  var $from = state.selection.$from;
  for (var d = $from.depth; d >= 0; d--) {
    var index = $from.index(d);
    if ($from.node(d).canReplaceWith(index, index, nodeType, attrs)) return true;
  }
  return false;
}

function insertImageItem(nodeType) {
  return new MenuItem({
    title: "Insert image",
    label: "Image",
    select: function select(state) {
      return canInsert(state, nodeType);
    },
    run: function run(state, _, view) {
      var _state$selection = state.selection,
          node = _state$selection.node,
          from = _state$selection.from,
          to = _state$selection.to,
          attrs = nodeType && node && node.type == nodeType && node.attrs;

      openPrompt({
        title: "Insert image",
        fields: {
          src: new TextField({ label: "Location", required: true, value: attrs && attrs.src }),
          title: new TextField({ label: "Title", value: attrs && attrs.title }),
          alt: new TextField({ label: "Description",
            value: attrs ? attrs.title : state.doc.textBetween(from, to, " ") })
        },
        // FIXME this (and similar uses) won't have the current state
        // when it runs, leading to problems in, for example, a
        // collaborative setup
        callback: function callback(attrs) {
          view.dispatch(view.state.tr.replaceSelection(nodeType.createAndFill(attrs)));
        }
      });
    }
  });
}

function insertImageEmbed(nodeType) {
  return new MenuItem({
    title: "Insert Image",
    label: "Image",
    icon: "media",
    dialogType: 'image',
    dialogExtension: ['.jpg', '.png', '.gif', '.tiff'],
    select: function select(state) {
      return canInsert(state, nodeType);
    },
    run: function run(state, dispatch, view, _ref) {
      var filename = _ref.filename,
          url = _ref.url;

      var textnode = _schema.schema.text('Enter caption.');
      var newNode2 = _schema.schema.nodes.caption.create({}, textnode);
      var newNode = _schema.schema.nodes.embed.create({
        filename: filename,
        align: 'full',
        size: '50%'
      }, newNode2);
      var transaction = state.tr.replaceSelectionWith(newNode);
      transaction = transaction.setMeta("uploadedFile", { filename: filename, url: url });
      dispatch(transaction);
    }
  });
}

function insertVideoEmbed(nodeType) {
  return new MenuItem({
    title: "Insert Video",
    label: "Video",
    icon: "mobile-video",
    dialogType: 'video',
    dialogExtension: ['.mp4', '.ogg', '.webm'],
    select: function select(state) {
      return canInsert(state, nodeType);
    },
    run: function run(state, dispatch, view, _ref2) {
      var filename = _ref2.filename,
          url = _ref2.url;

      var textnode = _schema.schema.text('Enter caption.');
      var newNode2 = _schema.schema.nodes.caption.create({}, textnode);
      var newNode = _schema.schema.nodes.embed.create({
        filename: filename,
        align: 'full',
        size: '50%'
      }, newNode2);
      var transaction = state.tr.replaceSelectionWith(newNode);
      transaction = transaction.setMeta("uploadedFile", { filename: filename, url: url });
      dispatch(transaction);
    }
  });
}

function insertReferenceEmbed(nodeType) {
  return new MenuItem({
    title: "Insert Reference",
    label: "Reference",
    icon: "book",
    dialogType: 'reference',
    dialogExtension: '.*',
    select: function select(state) {
      return canInsert(state, nodeType);
    },
    run: function run(state, dispatch, view, citationData) {
      // onAction({ type: 'addCitation' });
      // getPlugin('citations', state).props.createCitation(state, view.dispatch, citationData);
      dispatch(view.state.tr.setMeta("createCitation", citationData));
      // applyAction({'reference'});


      // insert(pos: number, content: Fragment | Node | [Node]) → Transform
      // Insert the given content at the given position.
    }
  });
}

function insertLatexEmbed(nodeType) {
  return new MenuItem({
    title: "Insert Equation",
    label: "Equation",
    icon: "function",
    select: function select(state) {
      return canInsert(state, nodeType);
    },
    run: function run(state, dispatch) {
      var newNode = nodeType.create({ content: '2x2' });
      // const node = newNode.replace(0, 1, "a");
      // newNode.content = schema.text('2x2');
      // console.log(newNode);
      // console.log(newNode);
      dispatch(state.tr.replaceSelectionWith(newNode));
    }
  });
}

function positiveInteger(value) {
  if (!/^[1-9]\d*$/.test(value)) return "Should be a positive integer";
}

function insertTableItem(tableType) {
  return new MenuItem({
    title: "Insert Table",
    icon: "th",
    dialogType: "table",
    run: function run(state, dispatch, view, _ref3) {
      var rows = _ref3.rows,
          cols = _ref3.cols;

      console.log('Making row!', rows, cols);
      var transaction = state.tr.replaceSelectionWith(createTable(tableType, +rows, +cols));
      view.dispatch(transaction);
    },
    select: function select(state) {
      var $from = state.selection.$from;
      for (var d = $from.depth; d >= 0; d--) {
        var index = $from.index(d);
        if ($from.node(d).canReplaceWith(index, index, tableType)) return true;
      }
      return false;
    },

    label: "Table"
  });
}

function cmdItem(cmd, options) {
  var passedOptions = {
    label: options.title,
    run: cmd,
    select: function select(state) {
      return cmd(state);
    }
  };
  for (var prop in options) {
    passedOptions[prop] = options[prop];
  }return new MenuItem(passedOptions);
}

function markActive(state, type) {
  var _state$selection2 = state.selection,
      from = _state$selection2.from,
      $from = _state$selection2.$from,
      to = _state$selection2.to,
      empty = _state$selection2.empty;

  if (empty) return type.isInSet(state.storedMarks || $from.marks());else return state.doc.rangeHasMark(from, to, type);
}

function markItem(markType, options) {
  var passedOptions = {
    active: function active(state) {
      return markActive(state, markType);
    }
  };
  for (var prop in options) {
    passedOptions[prop] = options[prop];
  }return cmdItem(toggleMark(markType), passedOptions);
}

function linkItem(markType) {
  return markItem(markType, {
    title: "Add or remove link",
    icon: "link",
    dialogType: "link",
    dialogCallback: true,
    run: function run(state, dispatch, view, openPrompt) {
      if (markActive(state, markType)) {
        console.log('Got  existing typee');
        toggleMark(markType)(state, view.dispatch);
        return true;
      }
      openPrompt({
        callback: function callback(attrs) {
          toggleMark(markType, attrs)(view.state, view.dispatch);
        }
      });
    }
  });
}

function wrapListItem(nodeType, options) {
  return cmdItem(wrapInList(nodeType, options.attrs), options);
}

// :: (Schema) → Object
// Given a schema, look for default mark and node types in it and
// return an object with relevant menu items relating to those marks:
//
// **`toggleStrong`**`: MenuItem`
//   : A menu item to toggle the [strong mark](#schema-basic.StrongMark).
//
// **`toggleEm`**`: MenuItem`
//   : A menu item to toggle the [emphasis mark](#schema-basic.EmMark).
//
// **`toggleCode`**`: MenuItem`
//   : A menu item to toggle the [code font mark](#schema-basic.CodeMark).
//
// **`toggleLink`**`: MenuItem`
//   : A menu item to toggle the [link mark](#schema-basic.LinkMark).
//
// **`insertImage`**`: MenuItem`
//   : A menu item to insert an [image](#schema-basic.Image).
//
// **`wrapBulletList`**`: MenuItem`
//   : A menu item to wrap the selection in a [bullet list](#schema-list.BulletList).
//
// **`wrapOrderedList`**`: MenuItem`
//   : A menu item to wrap the selection in an [ordered list](#schema-list.OrderedList).
//
// **`wrapBlockQuote`**`: MenuItem`
//   : A menu item to wrap the selection in a [block quote](#schema-basic.BlockQuote).
//
// **`makeParagraph`**`: MenuItem`
//   : A menu item to set the current textblock to be a normal
//     [paragraph](#schema-basic.Paragraph).
//
// **`makeCodeBlock`**`: MenuItem`
//   : A menu item to set the current textblock to be a
//     [code block](#schema-basic.CodeBlock).
//
// **`insertTable`**`: MenuItem`
//   : An item to insert a [table](#schema-table).
//
// **`addRowBefore`**, **`addRowAfter`**, **`removeRow`**, **`addColumnBefore`**, **`addColumnAfter`**, **`removeColumn`**`: MenuItem`
//   : Table-manipulation items.
//
// **`makeHead[N]`**`: MenuItem`
//   : Where _N_ is 1 to 6. Menu items to set the current textblock to
//     be a [heading](#schema-basic.Heading) of level _N_.
//
// **`insertHorizontalRule`**`: MenuItem`
//   : A menu item to insert a horizontal rule.
//
// The return value also contains some prefabricated menu elements and
// menus, that you can use instead of composing your own menu from
// scratch:
//
// **`insertMenu`**`: Dropdown`
//   : A dropdown containing the `insertImage` and
//     `insertHorizontalRule` items.
//
// **`typeMenu`**`: Dropdown`
//   : A dropdown containing the items for making the current
//     textblock a paragraph, code block, or heading.
//
// **`fullMenu`**`: [[MenuElement]]`
//   : An array of arrays of menu elements for use as the full menu
//     for, for example the [menu bar](#menu.MenuBarEditorView).
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