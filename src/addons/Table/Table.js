import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Fragment } from "prosemirror-model"
import { TextSelection } from "prosemirror-state"
import { keymap }  from "prosemirror-keymap"
import { tableNodes, columnResizing, tableEditing, goToNextCell, isInTable, deleteTable, mergeCells, splitCell, addRowBefore, addRowAfter, deleteRow, addColumnBefore, addColumnAfter, deleteColumn, toggleHeaderRow, toggleHeaderColumn, toggleHeaderCell } from 'prosemirror-tables';
import { Portal } from 'react-portal';
import { Button } from '@blueprintjs/core';

/* Notes
It seems like column widths are pixel based, which means they won't adjust responsively

*/

require('./table.scss');

const propTypes = {
	containerId: PropTypes.string,
	view: PropTypes.object,
	editorState: PropTypes.object,
	onOptionsRender: PropTypes.func.isRequired,
	optionsContainerRef: PropTypes.object.isRequired,
};

const defaultProps = {
	containerId: undefined,
	view: undefined,
	editorState: undefined,
};

/**
* @module Addons
*/

/**
* @component
*
* Support for HTML tables
*
* @example
return (
	<Editor>
 		<Table />
	</Editor>
);
*/
class Table extends Component {
	static pluginName = 'Table';

	static getPlugins({ pluginKey, isActive, usersData, userId }) {
		return [
			columnResizing(),
			tableEditing(),
			keymap({
				"Tab": goToNextCell(1),
				"Shift-Tab": goToNextCell(-1)
			})
		];
	}

	static schema = (props)=> {
		const pmTableNodes = tableNodes({
			tableGroup: "block",
			cellContent: "block+",
			cellAttributes: {
				background: {
					default: null,
					getFromDOM(dom) { return dom.style.backgroundColor || null },
					setDOMAttr(value, attrs) { if (value) attrs.style = (attrs.style || "") + `background-color: ${value};` }
				}
			}
		});

		pmTableNodes.table.insertMenu = {
			label: 'Table',
			icon: 'pt-icon-th',
			onInsert: (view) => {
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
			},
		},
		pmTableNodes.table.toStatic = (node, children)=> {
			return (
				<table key={node.currIndex}>
					<tbody>
						{children}
					</tbody>
				</table>
			);
		};
		pmTableNodes.table_cell.toStatic = (node, children)=> {
			return <td key={node.currIndex}>{children}</td>;
		};
		pmTableNodes.table_header.toStatic = (node, children)=> {
			return <th key={node.currIndex}>{children}</th>;
		};
		pmTableNodes.table_row.toStatic = (node, children)=> {
			return <tr key={node.currIndex}>{children}</tr>;
		};

		return {
			nodes: pmTableNodes
		};
	};

	constructor(props) {
		super(props);
		this.portalRefFunc = this.portalRefFunc.bind(this);
		document.execCommand("enableObjectResizing", false, false);
		document.execCommand("enableInlineTableEditing", false, false);
	}

	portalRefFunc(elem) {
		/* Used to call onOptioneRender so that optionsBox can be placed */
		const domAtPos = this.props.view.domAtPos(this.props.view.state.selection.from);
		const findTableElement = (node)=> {
			if (node.nodeName === 'BODY') { return undefined; }
			if (node.nodeName === 'TR') { return node; }
			return findTableElement(node.parentNode);
		}
		const nodeDom = findTableElement(domAtPos.node);
		if (nodeDom) {
			this.props.onOptionsRender(nodeDom, this.props.optionsContainerRef.current);	
		}
	}

	render() {
		const tableSelected = isInTable(this.props.editorState);
		if (tableSelected) { this.portalRefFunc(); }
		return (
			<div className="table-menu">
				{tableSelected &&
					<Portal 
						node={this.props.optionsContainerRef.current}
					>
						<div className="options-box">
							<div className="options-title">Table Details</div>
							
							{/*  Row Adjustment */}
							<label className="form-label">
								Row
							</label>
							<div className="pt-button-group pt-fill">
								<Button
									disabled={!addRowBefore(this.props.editorState)}
									onClick={()=> {
										addRowBefore(this.props.editorState, this.props.view.dispatch);
									}}
									text="Add Above"
								/>
								<Button
									disabled={!addRowAfter(this.props.editorState)}
									onClick={()=> {
										addRowAfter(this.props.editorState, this.props.view.dispatch);
									}}
									text="Add Below"
								/>
							</div>
							<div className="pt-button-group pt-fill">
								<Button
									disabled={!toggleHeaderRow(this.props.editorState)}
									onClick={()=> {
										toggleHeaderRow(this.props.editorState, this.props.view.dispatch);
									}}
									text="Toggle Header"
								/>
								<Button
									disabled={!deleteRow(this.props.editorState)}
									onClick={()=> {
										deleteRow(this.props.editorState, this.props.view.dispatch);
									}}
									text="Delete"
								/>
							</div>

							{/*  Column Adjustment */}
							<label className="form-label">
								Column
							</label>
							<div className="pt-button-group pt-fill">
								<Button
									disabled={!addColumnBefore(this.props.editorState)}
									onClick={()=> {
										addColumnBefore(this.props.editorState, this.props.view.dispatch);
									}}
									text="Add Left"
								/>
								<Button
									disabled={!addColumnAfter(this.props.editorState)}
									onClick={()=> {
										addColumnAfter(this.props.editorState, this.props.view.dispatch);
									}}
									text="Add Right"
								/>
							</div>
							<div className="pt-button-group pt-fill">
								<Button
									disabled={!toggleHeaderColumn(this.props.editorState)}
									onClick={()=> {
										toggleHeaderColumn(this.props.editorState, this.props.view.dispatch);
									}}
									text="Toggle Header"
								/>
								<Button
									disabled={!deleteColumn(this.props.editorState)}
									onClick={()=> {
										deleteColumn(this.props.editorState, this.props.view.dispatch);
									}}
									text="Delete"
								/>
							</div>

							{/*  Cell Adjustment */}
							<label className="form-label">
								Cell
							</label>
							<div className="pt-button-group pt-fill">
								<Button
									disabled={!mergeCells(this.props.editorState)}
									onClick={()=> {
										mergeCells(this.props.editorState, this.props.view.dispatch);
									}}
									text="Merge Cells"
								/>
								<Button
									disabled={!splitCell(this.props.editorState)}
									onClick={()=> {
										splitCell(this.props.editorState, this.props.view.dispatch);
									}}
									text="Split Cell"
								/>
							</div>
							<div className="pt-button-group pt-fill">
								<Button
									disabled={!toggleHeaderCell(this.props.editorState)}
									onClick={()=> {
										toggleHeaderCell(this.props.editorState, this.props.view.dispatch);
									}}
									text="Toggle Header Cell"
								/>
							</div>

							{/*  Table Adjustment */}
							<label className="form-label">
								Table
							</label>
							<div className="pt-button-group pt-fill">
								<Button
									disabled={!deleteTable(this.props.editorState)}
									onClick={()=> {
										deleteTable(this.props.editorState, this.props.view.dispatch);
										this.props.view.focus();
									}}
									text="Delete Table"
								/>
							</div>
						</div>
					</Portal>
				}
			</div>
		);
	}
}

Table.propTypes = propTypes;
Table.defaultProps = defaultProps;
export default Table;
