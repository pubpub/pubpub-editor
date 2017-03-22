/*
	// Block Cntrl-S from launching the Browser Save window
	document.getElementsByClassName('ProseMirror')[0].addEventListener('keydown', function(evt) {
		if (evt.keyCode === 83 && (navigator.platform.match('Mac') ? evt.metaKey : evt.ctrlKey)) {
			evt.preventDefault();
			evt.stopPropagation();
		}
	}, false);
*/


const {blockQuoteRule, orderedListRule, bulletListRule, codeBlockRule, headingRule,
       inputRules, allInputRules, InputRule} = require("prosemirror-inputrules")
const {keymap} = require("prosemirror-keymap")
const {history} = require("prosemirror-history")
const {baseKeymap} = require("prosemirror-commands")
const {Plugin} = require("prosemirror-state")

const {buildMenuItems} = require("./menu")
exports.buildMenuItems = buildMenuItems
const {buildKeymap} = require("./keymap")
exports.buildKeymap = buildKeymap

function pubpubSetup(options) {
  let deps = [
    inputRules({rules: allInputRules.concat(buildInputRules(options.schema))}),
    keymap(buildKeymap(options.schema, options.mapKeys)),
    keymap(baseKeymap)
  ]
  if (options.history !== false) deps.push(history())

  return deps.concat(new Plugin({
    props: {
      class: () => "PubPub-editor-style",
      menuContent: buildMenuItems(options.schema).fullMenu,
      floatingMenu: true
    }
  }))
}

exports.pubpubSetup = pubpubSetup

// :: (Schema) → [InputRule]
// A set of input rules for creating the basic block quotes, lists,
// code blocks, and heading.
function buildInputRules(schema) {
  let result = [], type
  if (type = schema.nodes.blockquote) result.push(blockQuoteRule(type))
  if (type = schema.nodes.ordered_list) result.push(orderedListRule(type))
  if (type = schema.nodes.bullet_list) result.push(bulletListRule(type))
  if (type = schema.nodes.code_block) result.push(codeBlockRule(type))
  if (type = schema.nodes.heading) result.push(headingRule(type, 6))
  return result
}

exports.buildInputRules = buildInputRules;
