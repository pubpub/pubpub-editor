const {lift, joinUp, selectParentNode, wrapIn, setBlockType} = require("prosemirror-commands")
const {undo, redo} = require("prosemirror-history")
const {toggleMark} = require("prosemirror-commands")
const {wrapInList} = require("prosemirror-schema-list")

class MenuItem {
  constructor(spec) {
    this.spec = spec
  }
}
exports.MenuItem = MenuItem

function translate(view, text) {
  return view.props.translate ? view.props.translate(text) : text
}

let lastMenuEvent = {time: 0, node: null}
function markMenuEvent(e) {
  lastMenuEvent.time = Date.now()
  lastMenuEvent.node = e.target
}
function isMenuEvent(wrapper) {
  return Date.now() - 100 < lastMenuEvent.time &&
    lastMenuEvent.node && wrapper.contains(lastMenuEvent.node)
}

class Dropdown {
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

function canInsert(state, nodeType, attrs) {
  let $from = state.selection.$from
  for (let d = $from.depth; d >= 0; d--) {
    let index = $from.index(d)
    if ($from.node(d).canReplaceWith(index, index, nodeType, attrs)) return true
  }
  return false
}

function insertImageEmbed(nodeType) {
  return new MenuItem({
    title: "Insert Image",
    label: "Image",
    icon: "media",
    dialogType: 'image',
    dialogExtension: ['.jpg','.png','.gif', '.tiff'],
    select(state) { return canInsert(state, nodeType) },
    run(state, dispatch, view, {filename, url}) {
      const textnode = schema.text('Enter caption.');
      const newNode2 = schema.nodes.caption.create({},textnode);
      const newNode = schema.nodes.embed.create({
        filename,
        align: 'full',
        size: '50%',
      }, newNode2);
      let transaction = state.tr.replaceSelectionWith(newNode);
      transaction = transaction.setMeta("uploadedFile",{filename, url});
      dispatch(transaction);
    }
  })
}

exports.insertImageEmbed = insertImageEmbed;


function insertVideoEmbed(nodeType) {
  return new MenuItem({
    title: "Insert Video",
    label: "Video",
    icon: "mobile-video",
    dialogType: 'video',
    dialogExtension: ['.mp4','.ogg','.webm'],
    select(state) { return canInsert(state, nodeType) },
    run(state, dispatch, view, {filename, url}) {
      const textnode = schema.text('Enter caption.');
      const newNode2 = schema.nodes.caption.create({},textnode);
      const newNode = schema.nodes.embed.create({
        filename,
        align: 'full',
        size: '50%',
      }, newNode2);
      let transaction = state.tr.replaceSelectionWith(newNode);
      transaction = transaction.setMeta("uploadedFile",{filename, url});
      dispatch(transaction);
    }
  })
}

exports.insertVideoEmbed = insertVideoEmbed;


function insertReferenceEmbed(nodeType) {
  return new MenuItem({
    title: "Insert Reference",
    label: "Reference",
    icon: "book",
    dialogType: 'reference',
    dialogExtension: '.*',
    select(state) { return canInsert(state, nodeType) },
    run(state, dispatch, view, citationData) {
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
    select(state) { return canInsert(state, nodeType) },
    run(state, dispatch)  {
      const newNode = nodeType.create({content: '2x2'});
      // const node = newNode.replace(0, 1, "a");
      // newNode.content = schema.text('2x2');
      // console.log(newNode);
      // console.log(newNode);
      dispatch(state.tr.replaceSelectionWith(newNode))
    }
  })
}

exports.insertLatexEmbed = insertLatexEmbed;


function insertTableItem(tableType) {
  return new MenuItem({
    title: "Insert Table",
    icon: "th",
    dialogType: "table",
    run(state, dispatch, view, {rows, cols}) {
      console.log('Making row!', rows, cols);
      const transaction = state.tr.replaceSelectionWith(createTable(tableType, +rows, +cols));
      view.dispatch(transaction);
    },
    select(state) {
      let $from = state.selection.$from
      for (let d = $from.depth; d >= 0; d--) {
        let index = $from.index(d)
        if ($from.node(d).canReplaceWith(index, index, tableType)) return true
      }
      return false
    },
    label: "Table"
  })
}

exports.insertTableItem = insertTableItem;


function insertHorizontalRule(hr) {
  return new MenuItem({
    title: "Insert horizontal rule",
    label: "Horizontal rule",
    icon: "small-minus",
    select(state) { return canInsert(state, hr) },
    run(state, onAction) { onAction(state.tr.replaceSelection(hr.create())) }
  })
}

exports.insertHorizontalRule = insertHorizontalRule;

function insertPageBreak(pb) {
  return new MenuItem({
    title: "Insert page break",
    label: "Page break",
    icon: "vertical-distribution",
    select(state) { return canInsert(state, pb) },
    run(state, onAction) { onAction(state.tr.replaceSelection(pb.create())) }
  });
}

exports.insertPageBreak = insertPageBreak;


function cmdItem(cmd, options) {
  let passedOptions = {
    label: options.title,
    run: cmd,
    select(state) { return cmd(state) }
  }
  for (let prop in options) passedOptions[prop] = options[prop]
  return new MenuItem(passedOptions)
}

exports.cmdItem = cmdItem;


function markActive(state, type) {
  let {from, $from, to, empty} = state.selection
  if (empty) return type.isInSet(state.storedMarks || $from.marks())
  else return state.doc.rangeHasMark(from, to, type)
}

exports.markActive = markActive;


function markItem(markType, options) {
  let passedOptions = {
    active(state) { return markActive(state, markType) }
  }
  for (let prop in options) passedOptions[prop] = options[prop]
  return cmdItem(toggleMark(markType), passedOptions)
}

exports.markItem = markItem;


function linkItem(markType) {
  return markItem(markType, {
    title: "Add or remove link",
    icon: "link",
    dialogType: "link",
    dialogCallback: true,
    run(state, dispatch, view, openPrompt) {

      if (markActive(state, markType)) {
        toggleMark(markType)(state, view.dispatch)
        return true
      }
      openPrompt({
        callback(attrs) {
          toggleMark(markType, attrs)(view.state, view.dispatch)
        }
      });

    }
  })
}

exports.linkItem = linkItem;


function wrapListItem(nodeType, options) {
  return cmdItem(wrapInList(nodeType, options.attrs), options)
}

exports.wrapListItem = wrapListItem;
