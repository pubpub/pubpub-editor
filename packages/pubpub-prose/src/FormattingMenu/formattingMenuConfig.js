import { joinUp, lift, selectParentNode, setBlockType, toggleMark, wrapIn } from 'prosemirror-commands';

import { schema } from '../prosemirror-setup';
import { wrapInList } from 'prosemirror-schema-list';

function getMenuItems(editor) {

	/* Marks */
	/* -------------- */
	function markIsActive(type) {
		// Check if the mark is currently active for the given selection
		// so that we can highlight the button as 'active'
		const state = editor.view.state;
		const { from, $from, to, empty } = state.selection;
		if (empty) {
			return type.isInSet(state.storedMarks || $from.marks());
		}
		return state.doc.rangeHasMark(from, to, type);
	}

	function applyToggleMark(mark) {
		// Toggle the mark on and off. Marks are things like bold, italic, etc
		const toggleFunction = toggleMark(mark);
		toggleFunction(editor.view.state, editor.view.dispatch);
	}
	/* -------------- */
	/* -------------- */


	/* Blocks */
	/* -------------- */
	function blockTypeIsActive(type, attrs) {
		const $from = editor.view.state.selection.$from;

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
		return setBlockFunction(editor.view.state, editor.view.dispatch);
	}
	/* -------------- */
	/* -------------- */


	/* Wraps */
	/* -------------- */
	function toggleWrap(type) {
		if (blockTypeIsActive(type)) {
			return lift(editor.view.state, editor.view.dispatch);
		}
		const wrapFunction = wrapIn(type);
		return wrapFunction(editor.view.state, editor.view.dispatch);
	}
	/* -------------- */
	/* -------------- */


	/* List Wraps */
	/* -------------- */
	function toggleWrapList(type) {
		if (blockTypeIsActive(type)) {
			return lift(editor.view.state, editor.view.dispatch);
		}
		const wrapFunction = wrapInList(type);
		return wrapFunction(editor.view.state, editor.view.dispatch);
	}
	/* -------------- */
	/* Create Link */

	function insertMention(state, dispatch, view,{url, type }) {

		const selection = view.selection;

		const textnode = schema.text(text);
		const transaction = view.state.tr.replaceSelectionWith(start, end, schema.nodes.mention.create({ url, type }, textnode));
		view.dispatch(transaction);
	}

	/* -------------- */


	const menuItems = [
		{
			text: 'H1',
			run: toggleBlockType.bind(this, schema.nodes.heading, { level: 1 }),
			isActive: blockTypeIsActive(schema.nodes.heading, { level: 1 }),
		},
		{
			text: 'H2',
			run: toggleBlockType.bind(this, schema.nodes.heading, { level: 2 }),
			isActive: blockTypeIsActive(schema.nodes.heading, { level: 2 }),
		},
		{
			icon: 'pt-icon-bold',
			text: 'B',
			run: applyToggleMark.bind(this, schema.marks.strong),
			isActive: markIsActive(schema.marks.strong),
		},
		{
			icon: 'pt-icon-italic',
			text: 'I',
			run: applyToggleMark.bind(this, schema.marks.em),
			isActive: markIsActive(schema.marks.em),
		},
		{
			icon: 'pt-icon-code',
			text: '</>',
			run: applyToggleMark.bind(this, schema.marks.code),
			isActive: markIsActive(schema.marks.code),
		},
		{
			text: 'Sub',
			run: applyToggleMark.bind(this, schema.marks.sub),
			isActive: markIsActive(schema.marks.sub),
		},
		{
			text: 'Sup',
			run: applyToggleMark.bind(this, schema.marks.sup),
			isActive: markIsActive(schema.marks.sup),
		},
		{
			text: '-',
			run: applyToggleMark.bind(this, schema.marks.strike),
			isActive: markIsActive(schema.marks.strike),
		},
		{
			icon: 'pt-icon-citation',
			text: '"',
			run: toggleWrap.bind(this, schema.nodes.blockquote),
			isActive: blockTypeIsActive(schema.nodes.blockquote),
		},
		{
			icon: 'pt-icon-properties',
			text: 'UL',
			run: toggleWrapList.bind(this, schema.nodes.bullet_list),
			isActive: blockTypeIsActive(schema.nodes.bullet_list),
		},
		{
			icon: 'pt-icon-numbered-list',
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
