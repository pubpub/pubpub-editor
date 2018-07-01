import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Fragment } from "prosemirror-model"
import { TextSelection } from "prosemirror-state"
import { keymap }  from "prosemirror-keymap"
import { tableNodes, columnResizing, tableEditing, goToNextCell, isInTable } from 'prosemirror-tables';
import { Portal } from 'react-portal';

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
		if (elem) {
			const domAtPos = this.props.view.domAtPos(this.props.view.state.selection.from);
			const findTableElement = (node)=> {
				if (node.nodeName === 'BODY') { return undefined; }
				if (node.nodeName === 'TABLE') { return node; }
				return findTableElement(node.parentNode);
			}
			const nodeDom = findTableElement(domAtPos.node);
			if (nodeDom) {
				this.props.onOptionsRender(nodeDom, this.props.optionsContainerRef.current);	
			}
		}
	}

	render() {
		console.log('isInTable: ', isInTable(this.props.editorState));
		return (
			<div className="table-menu">
				{isInTable(this.props.editorState) &&
					<Portal 
						ref={this.portalRefFunc} 
						node={this.props.optionsContainerRef.current}
					>
						<div className="options-box">
							<div className="options-title">Table Details</div>
							
							{/*  Size Adjustment */}
							<label className="form-label">
								Size
							</label>
							
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
