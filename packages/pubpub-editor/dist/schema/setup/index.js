'use strict';

var _prosemirrorInputrules = require('prosemirror-inputrules');

var _selectPlugin = require('./selectPlugin');

var _selectPlugin2 = _interopRequireDefault(_selectPlugin);

var _prosemirrorCommands = require('prosemirror-commands');

var _keymap = require('./keymap');

var _prosemirrorHistory = require('prosemirror-history');

var _prosemirrorKeymap = require('prosemirror-keymap');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.buildKeymap = _keymap.buildKeymap;

/*
	// Block Cntrl-S from launching the Browser Save window
	document.getElementsByClassName('ProseMirror')[0].addEventListener('keydown', function(evt) {
		if (evt.keyCode === 83 && (navigator.platform.match('Mac') ? evt.metaKey : evt.ctrlKey)) {
			evt.preventDefault();
			evt.stopPropagation();
		}
	}, false);
*/

function getBasePlugins(options) {
	var deps = [(0, _prosemirrorInputrules.inputRules)({ rules: _prosemirrorInputrules.allInputRules.concat(buildInputRules(options.schema)) }), (0, _prosemirrorKeymap.keymap)((0, _keymap.buildKeymap)(options.schema, options.mapKeys)), (0, _prosemirrorKeymap.keymap)(_prosemirrorCommands.baseKeymap), _selectPlugin2.default];
	if (options.history !== false) deps.push((0, _prosemirrorHistory.history)());

	return deps;
}

exports.getBasePlugins = getBasePlugins;

// :: (Schema) → [InputRule]
// A set of input rules for creating the basic block quotes, lists,
// code blocks, and heading.
function buildInputRules(schema) {
	var result = [],
	    type = void 0;
	if (type = schema.nodes.blockquote) result.push((0, _prosemirrorInputrules.blockQuoteRule)(type));
	if (type = schema.nodes.ordered_list) result.push((0, _prosemirrorInputrules.orderedListRule)(type));
	if (type = schema.nodes.bullet_list) result.push((0, _prosemirrorInputrules.bulletListRule)(type));
	if (type = schema.nodes.code_block) result.push((0, _prosemirrorInputrules.codeBlockRule)(type));
	if (type = schema.nodes.heading) result.push((0, _prosemirrorInputrules.headingRule)(type, 6));
	return result;
}

exports.buildInputRules = buildInputRules;