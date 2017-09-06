import { joinUp, lift, selectParentNode, setBlockType, toggleMark, wrapIn } from 'prosemirror-commands';

import { schema } from '../prosemirror-setup';
import { wrapInList } from 'prosemirror-schema-list';

function getMenuItems(view) {

	/* Marks */
	/* -------------- */
	function markIsActive(type) {
		// Check if the mark is currently active for the given selection
		// so that we can highlight the button as 'active'
		const state = view.state;
		const { from, $from, to, empty } = state.selection;
		if (empty) {
			return type.isInSet(state.storedMarks || $from.marks());
		}
		return state.doc.rangeHasMark(from, to, type);
	}

	function applyToggleMark(mark, attrs) {
		// Toggle the mark on and off. Marks are things like bold, italic, etc
		const toggleFunction = toggleMark(mark, attrs);
		toggleFunction(view.state, view.dispatch);
	}
	/* -------------- */
	/* -------------- */


	/* Blocks */
	/* -------------- */
	function blockTypeIsActive(type, attrs) {

		const $from = view.state.selection.$from;

		let wrapperDepth;
		let currentDepth = $from.depth;
		while (currentDepth > 0) {
			const currentNodeAtDepth = $from.node(currentDepth);
			const isType = currentNodeAtDepth.hasMarkup(type, attrs);
			if (isType) { wrapperDepth = currentDepth; }
			currentDepth -= 1;
		}

		// return wrapperDepth !== undefined;
		return wrapperDepth;
	}

	function toggleBlockType(type, attrs) {
		const isActive = blockTypeIsActive(type, attrs);
		const newNodeType = isActive ? schema.nodes.paragraph : type;
		const setBlockFunction = setBlockType(newNodeType, attrs);
		return setBlockFunction(view.state, view.dispatch);
	}
	/* -------------- */
	/* -------------- */


	/* Wraps */
	/* -------------- */
	function toggleWrap(type) {
		if (blockTypeIsActive(type)) {
			return lift(view.state, view.dispatch);
		}
		const wrapFunction = wrapIn(type);
		return wrapFunction(view.state, view.dispatch);
	}
	/* -------------- */
	/* -------------- */


	/* List Wraps */
	/* -------------- */
	function toggleWrapList(type) {
		if (blockTypeIsActive(type)) {
			return lift(view.state, view.dispatch);
		}
		const wrapFunction = wrapInList(type);
		return wrapFunction(view.state, view.dispatch);
	}
	/* -------------- */
	/* -------------- */

	const menuItems = [
		{
			icon: 'icon-header icon-h1',
			text: 'H1',
			run: toggleBlockType.bind(this, schema.nodes.heading, { level: 1 }),
			isActive: blockTypeIsActive(schema.nodes.heading, { level: 1 }),
		},
		{
			icon: 'icon-header icon-h2',
			text: 'H2',
			run: toggleBlockType.bind(this, schema.nodes.heading, { level: 2 }),
			isActive: blockTypeIsActive(schema.nodes.heading, { level: 2 }),
		},
		{
			icon: 'icon-bold',
			text: 'B',
			run: applyToggleMark.bind(this, schema.marks.strong),
			isActive: markIsActive(schema.marks.strong),
		},
		{
			icon: 'icon-italic',
			text: 'I',
			run: applyToggleMark.bind(this, schema.marks.em),
			isActive: markIsActive(schema.marks.em),
		},
		{
			icon: 'icon-code',
			text: '</>',
			run: applyToggleMark.bind(this, schema.marks.code),
			isActive: markIsActive(schema.marks.code),
		},
		{
			icon: 'icon-subscript',
			text: 'Sub',
			run: applyToggleMark.bind(this, schema.marks.sub),
			isActive: markIsActive(schema.marks.sub),
		},
		{
			icon: 'icon-superscript',
			text: 'Sup',
			run: applyToggleMark.bind(this, schema.marks.sup),
			isActive: markIsActive(schema.marks.sup),
		},
		{
			icon: 'icon-strike',
			text: '-',
			run: applyToggleMark.bind(this, schema.marks.strike),
			isActive: markIsActive(schema.marks.strike),
		},
		{
			icon: 'icon-quote-right',
			text: '"',
			run: toggleWrap.bind(this, schema.nodes.blockquote),
			isActive: blockTypeIsActive(schema.nodes.blockquote),
		},
		{
			icon: 'icon-list-bullet',
			text: 'UL',
			run: toggleWrapList.bind(this, schema.nodes.bullet_list),
			isActive: blockTypeIsActive(schema.nodes.bullet_list),
		},
		{
			icon: 'icon-list-numbered',
			text: 'OL',
			run: toggleWrapList.bind(this, schema.nodes.ordered_list),
			isActive: blockTypeIsActive(schema.nodes.ordered_list),
		},
		{
			icon: 'pt-icon-link',
			text: 'link',
			input: 'text',
			run: applyToggleMark.bind(this, schema.marks.link),
			isActive: markIsActive(schema.marks.link),
		},
		// {
		// 	icon: 'pt-icon-cb',
		// 	text: 'CodeB',
		// 	run: toggleBlockType.bind(this, schema.nodes.code_block, {}),
		// 	isActive: blockTypeIsActive(schema.nodes.code_block, {}),
		// },

	];


	return menuItems;
}

export default getMenuItems;
