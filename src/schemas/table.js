import React from 'react';
import { tableNodes } from 'prosemirror-tables';
import { Fragment } from 'prosemirror-model';

const pmTableNodes = tableNodes({
	tableGroup: 'block',
	cellContent: 'block+',
	cellAttributes: {
		background: {
			default: null,
			getFromDOM: (dom) => {
				return dom.style.backgroundColor || null;
			},
			setDOMAttr: (value, attrs) => {
				if (value) {
					/* eslint-disable-next-line no-param-reassign */
					attrs.style = `(attrs.style || '') background-color: ${value};`;
				}
			},
		},
	},
});

pmTableNodes.table.onInsert = (view) => {
	const numRows = 3;
	const numCols = 3;
	const { tr, schema } = view.state;
	const tableType = schema.nodes.table;
	const rowType = schema.nodes.table_row;
	const cellType = schema.nodes.table_cell;
	const cellNode = cellType.createAndFill({});
	const cells = [];
	for (let i = 0; i < numCols; i += 1) cells.push(cellNode);
	const rowNode = rowType.create(null, Fragment.from(cells));
	const rows = [];
	for (let i = 0; i < numRows; i += 1) rows.push(rowNode);
	const tableNode = tableType.create(null, Fragment.from(rows));
	view.dispatch(tr.replaceSelectionWith(tableNode).scrollIntoView());
};
pmTableNodes.table.toStatic = (node, options, isSelected, isEditable, editorProps, children) => {
	return (
		<table key={node.currIndex}>
			<tbody>{children}</tbody>
		</table>
	);
};
pmTableNodes.table_cell.toStatic = (
	node,
	options,
	isSelected,
	isEditable,
	editorProps,
	children,
) => {
	return <td key={node.currIndex}>{children}</td>;
};
pmTableNodes.table_header.toStatic = (
	node,
	options,
	isSelected,
	isEditable,
	editorProps,
	children,
) => {
	return <th key={node.currIndex}>{children}</th>;
};
pmTableNodes.table_row.toStatic = (
	node,
	options,
	isSelected,
	isEditable,
	editorProps,
	children,
) => {
	return <tr key={node.currIndex}>{children}</tr>;
};

export default pmTableNodes;
