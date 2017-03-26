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