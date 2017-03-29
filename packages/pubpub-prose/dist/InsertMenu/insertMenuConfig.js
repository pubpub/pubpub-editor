'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _prosemirrorSetup = require('../prosemirror-setup');

function getMenuItems(editor) {

	/* Horizontal Rule */
	/* -------------- */
	function insertHorizontalRule() {
		editor.view.dispatch(editor.view.state.tr.replaceSelectionWith(_prosemirrorSetup.schema.nodes.horizontal_rule.create()));
	}
	/* -------------- */
	/* -------------- */

	/* Latex Equation */
	/* -------------- */
	function insertLatexEquation() {
		var newNode = _prosemirrorSetup.schema.nodes.equation.create({ content: '\\sum_ix^i' });
		editor.view.dispatch(editor.view.state.tr.replaceSelectionWith(newNode));
	}
	/* -------------- */
	/* -------------- */

	var menuItems = [{
		icon: 'pt-icon-h1',
		text: 'Upload Media',
		run: function run() {}
	}, {
		icon: 'pt-icon-h1',
		text: 'Insert Table',
		run: function run() {}
	}, {
		icon: 'pt-icon-h1',
		text: 'Insert Equation',
		run: insertLatexEquation
	}, {
		icon: 'pt-icon-h1',
		text: 'Insert Horizontal Line',
		run: insertHorizontalRule
	}, {
		icon: 'pt-icon-h1',
		text: 'Add References',
		run: function run() {}
	}];

	return menuItems;
} // import { toggleMark, lift, joinUp, selectParentNode, wrapIn, setBlockType } from 'prosemirror-commands';
// import { wrapInList } from 'prosemirror-schema-list';

exports.default = getMenuItems;