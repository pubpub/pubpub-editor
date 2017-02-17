const {lift, joinUp, selectParentNode, wrapIn, setBlockType} = require("prosemirror-commands")
const {undo, redo} = require("prosemirror-history")

// ::- An icon or label that, when clicked, executes a command.
class MenuItem {
  // :: (MenuItemSpec)
  constructor(spec) {
    // :: MenuItemSpec
    // The spec used to create the menu item.
    this.spec = spec
  }

}
exports.MenuItem = MenuItem

function translate(view, text) {
  return view.props.translate ? view.props.translate(text) : text
}

// MenuItemSpec:: interface
// The configuration object passed to the `MenuItem` constructor.
//
//   run:: (EditorState, (Action), EditorView)
//   The function to execute when the menu item is activated.
//
//   select:: ?(EditorState) → bool
//   Optional function that is used to determine whether the item is
//   appropriate at the moment.
//
//   onDeselect:: ?string
//   Determines what happens when [`select`](#menu.MenuItemSpec.select)
//   returns false. The default is to hide the item, you can set this to
//   `"disable"` to instead render the item with a disabled style.
//
//   active:: ?(EditorState) → bool
//   A predicate function to determine whether the item is 'active' (for
//   example, the item for toggling the strong mark might be active then
//   the cursor is in strong text).
//
//   render:: ?(EditorView) → dom.Node
//   A function that renders the item. You must provide either this,
//   [`icon`](#menu.MenuItemSpec.icon), or [`label`](#MenuItemSpec.label).
//
//   icon:: ?Object
//   Describes an icon to show for this item. The object may specify
//   an SVG icon, in which case its `path` property should be an [SVG
//   path
//   spec](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/d),
//   and `width` and `height` should provide the viewbox in which that
//   path exists. Alternatively, it may have a `text` property
//   specifying a string of text that makes up the icon, with an
//   optional `css` property giving additional CSS styling for the
//   text. _Or_ it may contain `dom` property containing a DOM node.
//
//   label:: ?string
//   Makes the item show up as a text label. Mostly useful for items
//   wrapped in a [drop-down](#menu.Dropdown) or similar menu. The object
//   should have a `label` property providing the text to display.
//
//   title:: ?string
//   Defines DOM title (mouseover) text for the item.
//
//   class:: string
//   Optionally adds a CSS class to the item's DOM representation.
//
//   css:: string
//   Optionally adds a string of inline CSS to the item's DOM
//   representation.
//
//   execEvent:: string
//   Defines which event on the command's DOM representation should
//   trigger the execution of the command. Defaults to mousedown.

let lastMenuEvent = {time: 0, node: null}
function markMenuEvent(e) {
  lastMenuEvent.time = Date.now()
  lastMenuEvent.node = e.target
}
function isMenuEvent(wrapper) {
  return Date.now() - 100 < lastMenuEvent.time &&
    lastMenuEvent.node && wrapper.contains(lastMenuEvent.node)
}

// ::- A drop-down menu, displayed as a label with a downwards-pointing
// triangle to the right of it.
class Dropdown {
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
  constructor(content, options) {
    this.options = options || {}
    this.content = Array.isArray(content) ? content : [content]
  }

}
exports.Dropdown = Dropdown



// ::- Represents a submenu wrapping a group of elements that start
// hidden and expand to the right when hovered over or tapped.
class DropdownSubmenu {
  // :: ([MenuElement], ?Object)
  // Creates a submenu for the given group of menu elements. The
  // following options are recognized:
  //
  // **`label`**`: string`
  //   : The label to show on the submenu.
  constructor(content, options) {
    this.options = options || {}
    this.content = Array.isArray(content) ? content : [content]
  }

}
exports.DropdownSubmenu = DropdownSubmenu


// :: MenuItem
// Menu item for the `joinUp` command.
const joinUpItem = new MenuItem({
  title: "Join with above block",
  run: joinUp,
  select: state => joinUp(state),
  icon: ""
})
exports.joinUpItem = joinUpItem

// :: MenuItem
// Menu item for the `lift` command.
const liftItem = new MenuItem({
  icon: "Menu-closed",
  run: lift,
  select: state => lift(state),
  icon: "menu-closed"
})
exports.liftItem = liftItem

// :: MenuItem
// Menu item for the `selectParentNode` command.
const selectParentNodeItem = new MenuItem({
  title: "Select parent node",
  run: selectParentNode,
  select: state => selectParentNode(state),
  icon: ""
})
exports.selectParentNodeItem = selectParentNodeItem

// :: (Object) → MenuItem
// Menu item for the `undo` command.
let undoItem = new MenuItem({
  title: "Undo last change",
  run: undo,
  select: state => undo(state),
  icon: ""
})
exports.undoItem = undoItem

// :: (Object) → MenuItem
// Menu item for the `redo` command.
let redoItem = new MenuItem({
  title: "Redo last undone change",
  run: redo,
  select: state => redo(state),
  icon: ""
})
exports.redoItem = redoItem

// :: (NodeType, Object) → MenuItem
// Build a menu item for wrapping the selection in a given node type.
// Adds `run` and `select` properties to the ones present in
// `options`. `options.attrs` may be an object or a function, as in
// `toggleMarkItem`.
function wrapItem(nodeType, options) {
  let passedOptions = {
    run(state, onAction) {
      // FIXME if (options.attrs instanceof Function) options.attrs(state, attrs => wrapIn(nodeType, attrs)(state))
      return wrapIn(nodeType, options.attrs)(state, onAction)
    },
    select(state) {
      return wrapIn(nodeType, options.attrs instanceof Function ? null : options.attrs)(state)
    }
  }
  for (let prop in options) passedOptions[prop] = options[prop]
  return new MenuItem(passedOptions)
}
exports.wrapItem = wrapItem

// :: (NodeType, Object) → MenuItem
// Build a menu item for changing the type of the textblock around the
// selection to the given type. Provides `run`, `active`, and `select`
// properties. Others must be given in `options`. `options.attrs` may
// be an object to provide the attributes for the textblock node.
function blockTypeItem(nodeType, options) {
  let command = setBlockType(nodeType, options.attrs)
  let passedOptions = {
    run: command,
    select(state) { return command(state) },
    active(state) {
      let {$from, to, node} = state.selection
      if (node) return node.hasMarkup(nodeType, options.attrs)
      return to <= $from.end() && $from.parent.hasMarkup(nodeType, options.attrs)
    }
  }
  for (let prop in options) passedOptions[prop] = options[prop]
  return new MenuItem(passedOptions)
}
exports.blockTypeItem = blockTypeItem
