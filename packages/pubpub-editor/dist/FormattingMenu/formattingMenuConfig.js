'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _prosemirrorCommands = require('prosemirror-commands');

var _prosemirrorSetup = require('../prosemirror-setup');

var _prosemirrorSchemaList = require('prosemirror-schema-list');

function getMenuItems(editor) {

	/* Marks */
	/* -------------- */
	function markIsActive(type) {
		// Check if the mark is currently active for the given selection
		// so that we can highlight the button as 'active'
		var state = editor.view.state;
		var _state$selection = state.selection,
		    from = _state$selection.from,
		    $from = _state$selection.$from,
		    to = _state$selection.to,
		    empty = _state$selection.empty;

		if (empty) {
			return type.isInSet(state.storedMarks || $from.marks());
		}
		return state.doc.rangeHasMark(from, to, type);
	}

	function applyToggleMark(mark, attrs) {
		// Toggle the mark on and off. Marks are things like bold, italic, etc
		var toggleFunction = (0, _prosemirrorCommands.toggleMark)(mark, attrs);
		toggleFunction(editor.view.state, editor.view.dispatch);
	}
	/* -------------- */
	/* -------------- */

	/* Blocks */
	/* -------------- */
	function blockTypeIsActive(type, attrs) {

		var $from = editor.view.state.selection.$from;

		var wrapperDepth = void 0;
		var currentDepth = $from.depth;
		while (currentDepth > 0) {
			var currentNodeAtDepth = $from.node(currentDepth);
			var isType = currentNodeAtDepth.hasMarkup(type, attrs);
			if (isType) {
				wrapperDepth = currentDepth;
			}
			currentDepth -= 1;
		}

		// return wrapperDepth !== undefined;
		return wrapperDepth;
	}

	function toggleBlockType(type, attrs) {
		var isActive = blockTypeIsActive(type, attrs);
		var newNodeType = isActive ? _prosemirrorSetup.schema.nodes.paragraph : type;
		var setBlockFunction = (0, _prosemirrorCommands.setBlockType)(newNodeType, attrs);
		return setBlockFunction(editor.view.state, editor.view.dispatch);
	}
	/* -------------- */
	/* -------------- */

	/* Wraps */
	/* -------------- */
	function toggleWrap(type) {
		if (blockTypeIsActive(type)) {
			return (0, _prosemirrorCommands.lift)(editor.view.state, editor.view.dispatch);
		}
		var wrapFunction = (0, _prosemirrorCommands.wrapIn)(type);
		return wrapFunction(editor.view.state, editor.view.dispatch);
	}
	/* -------------- */
	/* -------------- */

	/* List Wraps */
	/* -------------- */
	function toggleWrapList(type) {
		if (blockTypeIsActive(type)) {
			return (0, _prosemirrorCommands.lift)(editor.view.state, editor.view.dispatch);
		}
		var wrapFunction = (0, _prosemirrorSchemaList.wrapInList)(type);
		return wrapFunction(editor.view.state, editor.view.dispatch);
	}
	/* -------------- */
	/* -------------- */

	var menuItems = [{
		icon: 'icon-header icon-h1',
		text: 'H1',
		run: toggleBlockType.bind(this, _prosemirrorSetup.schema.nodes.heading, { level: 1 }),
		isActive: blockTypeIsActive(_prosemirrorSetup.schema.nodes.heading, { level: 1 })
	}, {
		icon: 'icon-header icon-h2',
		text: 'H2',
		run: toggleBlockType.bind(this, _prosemirrorSetup.schema.nodes.heading, { level: 2 }),
		isActive: blockTypeIsActive(_prosemirrorSetup.schema.nodes.heading, { level: 2 })
	}, {
		icon: 'icon-bold',
		text: 'B',
		run: applyToggleMark.bind(this, _prosemirrorSetup.schema.marks.strong),
		isActive: markIsActive(_prosemirrorSetup.schema.marks.strong)
	}, {
		icon: 'icon-italic',
		text: 'I',
		run: applyToggleMark.bind(this, _prosemirrorSetup.schema.marks.em),
		isActive: markIsActive(_prosemirrorSetup.schema.marks.em)
	}, {
		icon: 'icon-code',
		text: '</>',
		run: applyToggleMark.bind(this, _prosemirrorSetup.schema.marks.code),
		isActive: markIsActive(_prosemirrorSetup.schema.marks.code)
	}, {
		icon: 'icon-subscript',
		text: 'Sub',
		run: applyToggleMark.bind(this, _prosemirrorSetup.schema.marks.sub),
		isActive: markIsActive(_prosemirrorSetup.schema.marks.sub)
	}, {
		icon: 'icon-superscript',
		text: 'Sup',
		run: applyToggleMark.bind(this, _prosemirrorSetup.schema.marks.sup),
		isActive: markIsActive(_prosemirrorSetup.schema.marks.sup)
	}, {
		icon: 'icon-strike',
		text: '-',
		run: applyToggleMark.bind(this, _prosemirrorSetup.schema.marks.strike),
		isActive: markIsActive(_prosemirrorSetup.schema.marks.strike)
	}, {
		icon: 'icon-quote-right',
		text: '"',
		run: toggleWrap.bind(this, _prosemirrorSetup.schema.nodes.blockquote),
		isActive: blockTypeIsActive(_prosemirrorSetup.schema.nodes.blockquote)
	}, {
		icon: 'icon-list-bullet',
		text: 'UL',
		run: toggleWrapList.bind(this, _prosemirrorSetup.schema.nodes.bullet_list),
		isActive: blockTypeIsActive(_prosemirrorSetup.schema.nodes.bullet_list)
	}, {
		icon: 'icon-list-numbered',
		text: 'OL',
		run: toggleWrapList.bind(this, _prosemirrorSetup.schema.nodes.ordered_list),
		isActive: blockTypeIsActive(_prosemirrorSetup.schema.nodes.ordered_list)
	}, {
		icon: 'pt-icon-link',
		text: 'link',
		input: 'text',
		run: applyToggleMark.bind(this, _prosemirrorSetup.schema.marks.link),
		isActive: markIsActive(_prosemirrorSetup.schema.marks.link)
	}];

	return menuItems;
}

exports.default = getMenuItems;