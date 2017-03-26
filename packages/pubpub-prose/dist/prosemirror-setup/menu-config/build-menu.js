"use strict";

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _require = require("prosemirror-commands"),
    lift = _require.lift,
    joinUp = _require.joinUp,
    selectParentNode = _require.selectParentNode,
    wrapIn = _require.wrapIn,
    setBlockType = _require.setBlockType;

var _require2 = require("prosemirror-history"),
    undo = _require2.undo,
    redo = _require2.redo;

var MenuItem = function MenuItem(spec) {
  _classCallCheck(this, MenuItem);

  this.spec = spec;
};

exports.MenuItem = MenuItem;

function translate(view, text) {
  return view.props.translate ? view.props.translate(text) : text;
}

var lastMenuEvent = { time: 0, node: null };
function markMenuEvent(e) {
  lastMenuEvent.time = Date.now();
  lastMenuEvent.node = e.target;
}
function isMenuEvent(wrapper) {
  return Date.now() - 100 < lastMenuEvent.time && lastMenuEvent.node && wrapper.contains(lastMenuEvent.node);
}

// ::- A drop-down menu, displayed as a label with a downwards-pointing
// triangle to the right of it.

var Dropdown =
// :: ([MenuElement], ?Object)
// Create a dropdown wrapping the elements. Options may include
// the following properties:
//
// **`label`**`: string`
//   : The label to show on the drop-down control.
//
// **`title`**`: string`
//   : Sets the
//     [`title`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/title)
//     attribute given to the menu control.
//
// **`class`**`: string`
//   : When given, adds an extra CSS class to the menu control.
//
// **`css`**`: string`
//   : When given, adds an extra set of CSS styles to the menu control.
function Dropdown(content, options) {
  _classCallCheck(this, Dropdown);

  this.options = options || {};
  this.content = Array.isArray(content) ? content : [content];
};

exports.Dropdown = Dropdown;

// ::- Represents a submenu wrapping a group of elements that start
// hidden and expand to the right when hovered over or tapped.

var DropdownSubmenu =
// :: ([MenuElement], ?Object)
// Creates a submenu for the given group of menu elements. The
// following options are recognized:
//
// **`label`**`: string`
//   : The label to show on the submenu.
function DropdownSubmenu(content, options) {
  _classCallCheck(this, DropdownSubmenu);

  this.options = options || {};
  this.content = Array.isArray(content) ? content : [content];
};

exports.DropdownSubmenu = DropdownSubmenu;

// :: MenuItem
// Menu item for the `joinUp` command.
var joinUpItem = new MenuItem({
  title: "Join with above block",
  run: joinUp,
  select: function select(state) {
    return joinUp(state);
  },
  icon: ""
});
exports.joinUpItem = joinUpItem;

// :: MenuItem
// Menu item for the `lift` command.
var liftItem = new MenuItem(_defineProperty({
  icon: "Menu-closed",
  run: lift,
  select: function select(state) {
    return lift(state);
  }
}, "icon", "menu-closed"));
exports.liftItem = liftItem;

// :: MenuItem
// Menu item for the `selectParentNode` command.
var selectParentNodeItem = new MenuItem({
  title: "Select parent node",
  run: selectParentNode,
  select: function select(state) {
    return selectParentNode(state);
  },
  icon: ""
});
exports.selectParentNodeItem = selectParentNodeItem;

// :: (Object) → MenuItem
// Menu item for the `undo` command.
var undoItem = new MenuItem({
  title: "Undo last change",
  run: undo,
  select: function select(state) {
    return undo(state);
  },
  icon: ""
});
exports.undoItem = undoItem;

// :: (Object) → MenuItem
// Menu item for the `redo` command.
var redoItem = new MenuItem({
  title: "Redo last undone change",
  run: redo,
  select: function select(state) {
    return redo(state);
  },
  icon: ""
});
exports.redoItem = redoItem;

// :: (NodeType, Object) → MenuItem
// Build a menu item for wrapping the selection in a given node type.
// Adds `run` and `select` properties to the ones present in
// `options`. `options.attrs` may be an object or a function, as in
// `toggleMarkItem`.
function wrapItem(nodeType, options) {
  var passedOptions = {
    run: function run(state, onAction) {
      // FIXME if (options.attrs instanceof Function) options.attrs(state, attrs => wrapIn(nodeType, attrs)(state))
      return wrapIn(nodeType, options.attrs)(state, onAction);
    },
    select: function select(state) {
      return wrapIn(nodeType, options.attrs instanceof Function ? null : options.attrs)(state);
    }
  };
  for (var prop in options) {
    passedOptions[prop] = options[prop];
  }return new MenuItem(passedOptions);
}
exports.wrapItem = wrapItem;

// :: (NodeType, Object) → MenuItem
// Build a menu item for changing the type of the textblock around the
// selection to the given type. Provides `run`, `active`, and `select`
// properties. Others must be given in `options`. `options.attrs` may
// be an object to provide the attributes for the textblock node.
function blockTypeItem(nodeType, options) {
  var command = setBlockType(nodeType, options.attrs);
  var passedOptions = {
    run: command,
    select: function select(state) {
      return command(state);
    },
    active: function active(state) {
      var _state$selection = state.selection,
          $from = _state$selection.$from,
          to = _state$selection.to,
          node = _state$selection.node;

      if (node) return node.hasMarkup(nodeType, options.attrs);
      return to <= $from.end() && $from.parent.hasMarkup(nodeType, options.attrs);
    }
  };
  for (var prop in options) {
    passedOptions[prop] = options[prop];
  }return new MenuItem(passedOptions);
}
exports.blockTypeItem = blockTypeItem;

function canInsert(state, nodeType, attrs) {
  var $from = state.selection.$from;
  for (var d = $from.depth; d >= 0; d--) {
    var index = $from.index(d);
    if ($from.node(d).canReplaceWith(index, index, nodeType, attrs)) return true;
  }
  return false;
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
    run: function run(state, dispatch, view, _ref2) {
      var filename = _ref2.filename,
          url = _ref2.url;

      var textnode = schema.text('Enter caption.');
      var newNode2 = schema.nodes.caption.create({}, textnode);
      var newNode = schema.nodes.embed.create({
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

exports.insertImageEmbed = insertImageEmbed;

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
    run: function run(state, dispatch, view, _ref3) {
      var filename = _ref3.filename,
          url = _ref3.url;

      var textnode = schema.text('Enter caption.');
      var newNode2 = schema.nodes.caption.create({}, textnode);
      var newNode = schema.nodes.embed.create({
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

exports.insertVideoEmbed = insertVideoEmbed;

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

exports.insertReferenceEmbed = insertReferenceEmbed;

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

exports.insertLatexEmbed = insertLatexEmbed;

function insertTableItem(tableType) {
  return new MenuItem({
    title: "Insert Table",
    icon: "th",
    dialogType: "table",
    run: function run(state, dispatch, view, _ref4) {
      var rows = _ref4.rows,
          cols = _ref4.cols;

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

exports.insertTableItem = insertTableItem;

function insertHorizontalRule(hr) {
  return new MenuItem({
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
}

exports.insertHorizontalRule = insertHorizontalRule;

function insertPageBreak(pb) {
  return new MenuItem({
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
}

exports.insertPageBreak = insertPageBreak;

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

exports.cmdItem = cmdItem;

function markActive(state, type) {
  var _state$selection2 = state.selection,
      from = _state$selection2.from,
      $from = _state$selection2.$from,
      to = _state$selection2.to,
      empty = _state$selection2.empty;

  if (empty) return type.isInSet(state.storedMarks || $from.marks());else return state.doc.rangeHasMark(from, to, type);
}

exports.markActive = markActive;

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

exports.markItem = linkItem;

function linkItem(markType) {
  return markItem(markType, {
    title: "Add or remove link",
    icon: "link",
    dialogType: "link",
    dialogCallback: true,
    run: function run(state, dispatch, view, openPrompt) {
      if (markActive(state, markType)) {
        toggleMark(markType)(state, view.dispatch);
        return true;
      }
    }
  });
}

exports.linkItem = linkItem;

function wrapListItem(nodeType, options) {
  return cmdItem(wrapInList(nodeType, options.attrs), options);
}

exports.wrapListItem = wrapListItem;