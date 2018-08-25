import { Plugin, NodeSelection } from 'prosemirror-state';
import { lift, setBlockType, toggleMark, wrapIn } from 'prosemirror-commands';
import { wrapInList } from 'prosemirror-schema-list';

const getInsertFunctions = (editorView)=> {
	/* Gather all node insert functions. These will be used to populate menus. */
	return Object.values(editorView.state.schema.nodes).filter((node)=> {
		return node.spec.onInsert;
	}).reduce((prev, curr)=> {
		return {
			...prev,
			[curr.name]: (attrs)=> {
				curr.spec.onInsert(editorView, attrs);
			}
		};
	}, {});
};

const getMenuItems = (editorView)=> {
	const schema = editorView.state.schema;

	/* Marks */
	/* -------------- */
	function markIsActive(type) {
		// Check if the mark is currently active for the given selection
		// so that we can highlight the button as 'active'
		const state = editorView.state;
		const { from, $from, to, empty } = state.selection;
		if (empty) {
			return !!type.isInSet(state.storedMarks || $from.marks());
		}
		return state.doc.rangeHasMark(from, to, type);
	}

	function applyToggleMark(mark, attrs) {
		// Toggle the mark on and off. Marks are things like bold, italic, etc
		const toggleFunction = toggleMark(mark, attrs);
		toggleFunction(editorView.state, editorView.dispatch);
	}
	/* -------------- */
	/* -------------- */


	/* Blocks */
	/* -------------- */
	function blockTypeIsActive(type, attrs = {}) {
		const $from = editorView.state.selection.$from;

		let wrapperDepth;
		let currentDepth = $from.depth;
		while (currentDepth > 0) {
			const currentNodeAtDepth = $from.node(currentDepth);
			const comparisonAttrs = { ...attrs };
			if (currentNodeAtDepth.attrs.id) {
				comparisonAttrs.id = currentNodeAtDepth.attrs.id;
			}

			/* Previous versions used node.hasMarkup but that */
			/* mandates deep equality on attrs. We just want to */
			/* ensure that everyting in the passed in attrs */
			/* is present in the node at the depth */
			const isType = type.name === currentNodeAtDepth.type.name;
			const hasAttrs = Object.keys(attrs).reduce((prev, curr)=> {
				if (attrs[curr] !== currentNodeAtDepth.attrs[curr]) { return false; }
				return prev;
			}, true);

			if (isType && hasAttrs) { wrapperDepth = currentDepth; }
			currentDepth -= 1;
		}

		return !!wrapperDepth;
	}

	function toggleBlockType(type, attrs) {
		const isActive = blockTypeIsActive(type, attrs);
		const newNodeType = isActive ? schema.nodes.paragraph : type;
		const setBlockFunction = setBlockType(newNodeType, attrs);
		return setBlockFunction(editorView.state, editorView.dispatch);
	}
	/* -------------- */
	/* -------------- */


	/* Wraps */
	/* -------------- */
	function toggleWrap(type) {
		if (blockTypeIsActive(type)) {
			return lift(editorView.state, editorView.dispatch);
		}
		const wrapFunction = wrapIn(type);
		return wrapFunction(editorView.state, editorView.dispatch);
	}
	/* -------------- */
	/* -------------- */


	/* List Wraps */
	/* -------------- */
	function toggleWrapList(type) {
		if (blockTypeIsActive(type)) {
			return lift(editorView.state, editorView.dispatch);
		}
		const wrapFunction = wrapInList(type);
		return wrapFunction(editorView.state, editorView.dispatch);
	}
	/* -------------- */
	/* -------------- */

	const menuItems = [
		{
			title: 'header1',
			run: toggleBlockType.bind(this, schema.nodes.heading, { level: 1 }),
			isActive: blockTypeIsActive(schema.nodes.heading, { level: 1 }),
		},
		{
			title: 'header2',
			run: toggleBlockType.bind(this, schema.nodes.heading, { level: 2 }),
			isActive: blockTypeIsActive(schema.nodes.heading, { level: 2 }),
		},
		{
			title: 'header3',
			run: toggleBlockType.bind(this, schema.nodes.heading, { level: 3 }),
			isActive: blockTypeIsActive(schema.nodes.heading, { level: 3 }),
		},
		{
			title: 'header4',
			run: toggleBlockType.bind(this, schema.nodes.heading, { level: 4 }),
			isActive: blockTypeIsActive(schema.nodes.heading, { level: 4 }),
		},
		{
			title: 'header5',
			run: toggleBlockType.bind(this, schema.nodes.heading, { level: 5 }),
			isActive: blockTypeIsActive(schema.nodes.heading, { level: 5 }),
		},
		{
			title: 'header6',
			run: toggleBlockType.bind(this, schema.nodes.heading, { level: 6 }),
			isActive: blockTypeIsActive(schema.nodes.heading, { level: 6 }),
		},
		{
			title: 'bold',
			run: applyToggleMark.bind(this, schema.marks.strong),
			isActive: markIsActive(schema.marks.strong),
		},
		{
			title: 'italic',
			run: applyToggleMark.bind(this, schema.marks.em),
			isActive: markIsActive(schema.marks.em),
		},
		{
			title: 'code',
			run: applyToggleMark.bind(this, schema.marks.code),
			isActive: markIsActive(schema.marks.code),
		},
		{
			title: 'subscript',
			run: applyToggleMark.bind(this, schema.marks.sub),
			isActive: markIsActive(schema.marks.sub),
		},
		{
			title: 'superscript',
			run: applyToggleMark.bind(this, schema.marks.sup),
			isActive: markIsActive(schema.marks.sup),
		},
		{
			title: 'strikethrough',
			run: applyToggleMark.bind(this, schema.marks.strike),
			isActive: markIsActive(schema.marks.strike),
		},
		{
			title: 'blockquote',
			run: toggleWrap.bind(this, schema.nodes.blockquote),
			isActive: blockTypeIsActive(schema.nodes.blockquote),
		},
		{
			title: 'bullet-list',
			run: toggleWrapList.bind(this, schema.nodes.bullet_list),
			isActive: blockTypeIsActive(schema.nodes.bullet_list),
		},
		{
			title: 'numbered-list',
			run: toggleWrapList.bind(this, schema.nodes.ordered_list),
			isActive: blockTypeIsActive(schema.nodes.ordered_list),
		},
		{
			title: 'link',
			input: 'text',
			run: applyToggleMark.bind(this, schema.marks.link),
			isActive: markIsActive(schema.marks.link),
		},
	];

	return menuItems;
};

const getRangeBoundingBox = (editorView, fromPos, toPos)=> {
	const fromBoundingBox = editorView.coordsAtPos(fromPos);
	const toBoundingBox = editorView.coordsAtPos(toPos);
	return {
		left: fromBoundingBox.left,
		top: fromBoundingBox.top,
		right: toBoundingBox.right,
		bottom: toBoundingBox.bottom,
	};
};

const getDecorations = (editorView)=> {
	const decorations = editorView.docView.innerDeco;
	return decorations.find().map((decoration)=> {
		return {
			from: decoration.from,
			to: decoration.to,
			boundingBox: getRangeBoundingBox(editorView, decoration.from, decoration.to),
			attrs: decoration.type.attrs,
		};
	});
};

/* This plugin is used to call onChange with */
/* all of the new editor values. */
export default (schema, props)=> {
	return new Plugin({
		view: ()=> {
			return {
				update: (editorView)=> {
					const updateAttrs = (newAttrs)=> {
						const start = editorView.state.selection.from;
						if (start !== undefined) {
							const oldNodeAttrs = editorView.state.selection.node.attrs;
							const transaction = editorView.state.tr.setNodeMarkup(
								start,
								null,
								{ ...oldNodeAttrs, ...newAttrs }
							);
							if (editorView.state.selection.node.type.isInline) {
								/* Inline nodeviews lose focus on content change */
								/* this fixes that issue. */
								const sel = NodeSelection.create(editorView.state.doc, start);
								transaction.setSelection(sel);
							}
							editorView.dispatch(transaction);
						}
					};

					const isNodeView = !!editorView.state.selection.node;

					props.onChange({
						/* The current editor view. */
						view: editorView,
						/* The active selection. */
						selection: editorView.state.selection,
						/* The bounding box for the active selection. */
						selectionBoundingBox: getRangeBoundingBox(editorView, editorView.state.selection.from, editorView.state.selection.to),
						/* If the active selection is of a NodeView, provide the selected node. */
						selectedNode: isNodeView ? editorView.state.selection.node : undefined,
						/* If the active selection is of a NodeView, provide a function update the selected node. */
						/* The updateNode function expects an object of attrs as its sole input */
						updateNode: isNodeView ? updateAttrs : undefined,
						/* The full list of available node insert functions. */
						/* Each insert function expect an object of attrs as */
						/* its sole input. */
						insertFunctions: getInsertFunctions(editorView),
						/* The full list of menu items, their status, and their click handler. */
						menuItems: getMenuItems(editorView),
						/* The full list of decorations and their bounding boxes */
						decorations: getDecorations(editorView),
					});
				}
			};
		}
	});
};
