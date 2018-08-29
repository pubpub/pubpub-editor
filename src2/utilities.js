import { Selection } from 'prosemirror-state';
import { DOMParser } from 'prosemirror-model';

export const dispatchEmptyTransaction = (editorView)=> {
	const emptyInitTransaction = editorView.state.tr;
	editorView.dispatch(emptyInitTransaction);
};

export const renderStatic = (schema, nodeArray, editorProps)=> {
	return nodeArray.map((node, index)=> {
		let children;
		if (node.content) {
			children = renderStatic(schema, node.content, editorProps);
		}
		if (node.type === 'text') {
			const marks = node.marks || [];
			children = marks.reduce((prev, curr)=> {
				const MarkComponent = schema.marks[curr.type].spec.toStatic(curr, prev);
				return MarkComponent;
			}, node.text);
		}

		const nodeWithIndex = node;
		nodeWithIndex.currIndex = index;
		const customOptions = editorProps.nodeOptions[node.type] || {};
		const mergedOptions = { ...schema.nodes[node.type].defaultOptions, ...customOptions };
		const NodeComponent = schema.nodes[node.type].spec.toStatic(nodeWithIndex, mergedOptions, false, false, editorProps, children);
		return NodeComponent;
	});
};

export const getJSON = (editorView)=> {
	return editorView.state.doc.toJSON();
};

export const getText = (editorView, separator = '\n')=> {
	return editorView.state.doc.textBetween(0, editorView.state.doc.nodeSize - 2, separator);
};

export const getCollabJSONs = (editorView, collabIds)=> {
	const collabPlugin = editorView.state.plugins.reduce((prev, curr)=> {
		if (curr.constructor.name === 'CollaborativePlugin') { return curr; }
		return prev;
	}, undefined);

	return collabPlugin
		? collabPlugin.getJSONs(collabIds)
		: null;
};

export const importHtml = (editorView, htmlString)=> {
	/* Create wrapper DOM node */
	const wrapperElem = document.createElement('div');

	/* Insert htmlString into wrapperElem to generate full DOM tree */
	wrapperElem.innerHTML = htmlString;

	/* Generate new ProseMirror doc from DOM node */
	const newDoc = DOMParser.fromSchema(editorView.state.schema).parse(wrapperElem);

	/* Create transaction and set selection to the beginning of the doc */
	const tr = editorView.state.tr;
	tr.setSelection(Selection.atStart(editorView.state.doc));

	/* Insert each node of newDoc to current doc */
	/* Note, we don't want to just replaceSelectionWith(newDoc) */
	/* because it will add a doc within a doc. */
	newDoc.content.content.forEach((node)=> {
		tr.replaceSelectionWith(node);
	});

	/* Dispatch transaction to setSelection and insert content */
	editorView.dispatch(tr);
};

export const focus = (editorView)=> {
	editorView.focus();
};
