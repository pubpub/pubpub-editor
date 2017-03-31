'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _prosemirrorCommands = require('prosemirror-commands');

var _prosemirrorSchemaList = require('prosemirror-schema-list');

var _prosemirrorSetup = require('../prosemirror-setup');

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

	function applyToggleMark(mark) {
		// Toggle the mark on and off. Marks are things like bold, italic, etc
		var toggleFunction = (0, _prosemirrorCommands.toggleMark)(mark);
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
		icon: 'pt-icon-h1',
		text: 'H1',
		run: toggleBlockType.bind(this, _prosemirrorSetup.schema.nodes.heading, { level: 1 }),
		isActive: blockTypeIsActive(_prosemirrorSetup.schema.nodes.heading, { level: 1 })
	}, {
		icon: 'pt-icon-h2',
		text: 'H2',
		run: toggleBlockType.bind(this, _prosemirrorSetup.schema.nodes.heading, { level: 2 }),
		isActive: blockTypeIsActive(_prosemirrorSetup.schema.nodes.heading, { level: 2 })
	}, {
		icon: 'pt-icon-bold',
		text: 'B',
		run: applyToggleMark.bind(this, _prosemirrorSetup.schema.marks.strong),
		isActive: markIsActive(_prosemirrorSetup.schema.marks.strong)
	}, {
		icon: 'pt-icon-italic',
		text: 'I',
		run: applyToggleMark.bind(this, _prosemirrorSetup.schema.marks.em),
		isActive: markIsActive(_prosemirrorSetup.schema.marks.em)
	}, {
		icon: 'pt-icon-code',
		text: '</>',
		run: applyToggleMark.bind(this, _prosemirrorSetup.schema.marks.code),
		isActive: markIsActive(_prosemirrorSetup.schema.marks.code)
	}, {
		icon: 'pt-icon-sub',
		text: 'Sub',
		run: applyToggleMark.bind(this, _prosemirrorSetup.schema.marks.sub),
		isActive: markIsActive(_prosemirrorSetup.schema.marks.sub)
	}, {
		icon: 'pt-icon-sup',
		text: 'Sup',
		run: applyToggleMark.bind(this, _prosemirrorSetup.schema.marks.sup),
		isActive: markIsActive(_prosemirrorSetup.schema.marks.sup)
	}, {
		icon: 'pt-icon-strike',
		text: '-',
		run: applyToggleMark.bind(this, _prosemirrorSetup.schema.marks.strike),
		isActive: markIsActive(_prosemirrorSetup.schema.marks.strike)
	}, {
		icon: 'pt-icon-citation',
		text: '"',
		run: toggleWrap.bind(this, _prosemirrorSetup.schema.nodes.blockquote),
		isActive: blockTypeIsActive(_prosemirrorSetup.schema.nodes.blockquote)
	}, {
		icon: 'pt-icon-bulletList',
		text: 'UL',
		run: toggleWrapList.bind(this, _prosemirrorSetup.schema.nodes.bullet_list),
		isActive: blockTypeIsActive(_prosemirrorSetup.schema.nodes.bullet_list)
	}, {
		icon: 'pt-icon-orderedList',
		text: 'OL',
		run: toggleWrapList.bind(this, _prosemirrorSetup.schema.nodes.ordered_list),
		isActive: blockTypeIsActive(_prosemirrorSetup.schema.nodes.ordered_list)
	}];

	return menuItems;
}

exports.default = getMenuItems;