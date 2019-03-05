import { Selection, TextSelection } from 'prosemirror-state';

export const moveSelectionToStart = (editorView) => {
	/* Create transaction and set selection to the beginning of the doc */
	const { tr } = editorView.state;
	tr.setSelection(Selection.atStart(editorView.state.doc));

	/* Dispatch transaction to setSelection and insert content */
	editorView.dispatch(tr);
};

export const moveSelectionToEnd = (editorView) => {
	/* Create transaction and set selection to the end of the doc */
	const { tr } = editorView.state;
	tr.setSelection(Selection.atEnd(editorView.state.doc));

	/* Dispatch transaction to setSelection and insert content */
	editorView.dispatch(tr);
};

export const moveToStartOfSelection = (editorView) => {
	const { tr } = editorView.state;
	editorView.dispatch(tr.setSelection(new TextSelection(editorView.state.selection.$from)));
};

export const moveToEndOfSelection = (editorView) => {
	const { tr } = editorView.state;
	editorView.dispatch(tr.setSelection(new TextSelection(editorView.state.selection.$to)));
};
