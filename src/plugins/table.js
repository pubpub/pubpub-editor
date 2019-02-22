import { keymap } from 'prosemirror-keymap';
import { columnResizing, tableEditing, goToNextCell } from 'prosemirror-tables';

export default (schema, props) => {
	if (props.isReadOnly || !schema.nodes.table) {
		return [];
	}

	document.execCommand('enableObjectResizing', false, false);
	document.execCommand('enableInlineTableEditing', false, false);
	return [
		columnResizing(),
		tableEditing(),
		keymap({
			Tab: goToNextCell(1),
			'Shift-Tab': goToNextCell(-1),
		}),
	];
};
