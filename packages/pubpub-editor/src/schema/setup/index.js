import { InputRule, allInputRules, blockQuoteRule, bulletListRule, codeBlockRule, headingRule, inputRules, orderedListRule } from "prosemirror-inputrules";

import SelectPlugin from './selectPlugin';
import { baseKeymap } from 'prosemirror-commands';
import { buildKeymap } from './keymap';
import { history } from 'prosemirror-history';
import { keymap } from 'prosemirror-keymap';

exports.buildKeymap = buildKeymap;

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
	let deps = [
		inputRules({ rules: allInputRules.concat(buildInputRules(options.schema)) }),
		keymap(buildKeymap(options.schema, options.mapKeys)),
		keymap(baseKeymap),
		SelectPlugin
	];
	if (options.history !== false) deps.push(history())

	return deps;
}

exports.getBasePlugins = getBasePlugins;

// :: (Schema) → [InputRule]
// A set of input rules for creating the basic block quotes, lists,
// code blocks, and heading.
function buildInputRules(schema) {
	let result = [], type
	if (type = schema.nodes.blockquote) result.push(blockQuoteRule(type));
	if (type = schema.nodes.ordered_list) result.push(orderedListRule(type));
	if (type = schema.nodes.bullet_list) result.push(bulletListRule(type));
	if (type = schema.nodes.code_block) result.push(codeBlockRule(type));
	if (type = schema.nodes.heading) result.push(headingRule(type, 6));
	return result;
}

exports.buildInputRules = buildInputRules;
