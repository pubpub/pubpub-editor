"use strict";

/*
	// Block Cntrl-S from launching the Browser Save window
	document.getElementsByClassName('ProseMirror')[0].addEventListener('keydown', function(evt) {
		if (evt.keyCode === 83 && (navigator.platform.match('Mac') ? evt.metaKey : evt.ctrlKey)) {
			evt.preventDefault();
			evt.stopPropagation();
		}
	}, false);
*/

var _require = require("prosemirror-inputrules"),
    blockQuoteRule = _require.blockQuoteRule,
    orderedListRule = _require.orderedListRule,
    bulletListRule = _require.bulletListRule,
    codeBlockRule = _require.codeBlockRule,
    headingRule = _require.headingRule,
    inputRules = _require.inputRules,
    allInputRules = _require.allInputRules,
    InputRule = _require.InputRule;

var _require2 = require("prosemirror-keymap"),
    keymap = _require2.keymap;

var _require3 = require("prosemirror-history"),
    history = _require3.history;

var _require4 = require("prosemirror-commands"),
    baseKeymap = _require4.baseKeymap;

var _require5 = require("prosemirror-state"),
    Plugin = _require5.Plugin;

var _require6 = require("./menu-config"),
    buildMenuItems = _require6.buildMenuItems;

exports.buildMenuItems = buildMenuItems;

var _require7 = require("./keymap"),
    buildKeymap = _require7.buildKeymap;

exports.buildKeymap = buildKeymap;

function pubpubSetup(options) {
  var deps = [inputRules({ rules: allInputRules.concat(buildInputRules(options.schema)) }), keymap(buildKeymap(options.schema, options.mapKeys)), keymap(baseKeymap)];
  if (options.history !== false) deps.push(history());

  return deps.concat(new Plugin({
    props: {
      class: function _class() {
        return "PubPub-editor-style";
      },
      menuContent: buildMenuItems(options.schema).fullMenu,
      floatingMenu: true
    }
  }));
}

exports.pubpubSetup = pubpubSetup;

// :: (Schema) → [InputRule]
// A set of input rules for creating the basic block quotes, lists,
// code blocks, and heading.
function buildInputRules(schema) {
  var result = [],
      type = void 0;
  if (type = schema.nodes.blockquote) result.push(blockQuoteRule(type));
  if (type = schema.nodes.ordered_list) result.push(orderedListRule(type));
  if (type = schema.nodes.bullet_list) result.push(bulletListRule(type));
  if (type = schema.nodes.code_block) result.push(codeBlockRule(type));
  if (type = schema.nodes.heading) result.push(headingRule(type, 6));
  return result;
}

exports.buildInputRules = buildInputRules;