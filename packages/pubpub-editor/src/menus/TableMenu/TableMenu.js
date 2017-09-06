import React, { PropTypes } from 'react';
import { inTable, menuItems } from './tableMenuConfig';

import { Tooltip } from '@blueprintjs/core';

let styles;

export const TableMenu = React.createClass({
	propTypes: {
	},

	getInitialState: function() {
		return { top: null, left: null };
	},

	onCursorChange() {
		this.onChange();
	},

	onChange() {

		const { view, containerId } = this.context;
		const sel = view.state.selection;
		if (inTable(sel.$from) == -1 || !sel.empty) {
			if (this.state.top) {
				this.setState({ top: null });
			}
			return;
		}

		const container = document.getElementById(containerId);
		const currentFromPos = sel.$from.pos;
		const left = view.coordsAtPos(currentFromPos).left - container.getBoundingClientRect().left;
		const inlineCenter = left;
		const inlineTop = view.coordsAtPos(currentFromPos).top - container.getBoundingClientRect().top;

		this.setState({
			left: inlineCenter,
			top: inlineTop,
		});

	},

	render: function() {
		const { top, left } = this.state;
		const { view } = this.context;

		if (!top || !editor || !view ) {
			return null;
		}

		return (
			<div className={'pt-card pt-elevation-0 pt-dark'} style={styles.container(top, left)}>
				{menuItems.map((item, index)=> {
					const isActive = item.isActive(view.state);
					const run = item.run.bind(this, view.state, view.dispatch);
					return (<button key={`menuItem-${index}`} className={'pt-button pt-minimal'} style={isActive ? { ...styles.button, ...styles.active } : styles.button} onClick={run}>

            <Tooltip
								tooltipClassName="pt-dark"
								transitionDuration={25}
                className="pt-dark pt-tooltip-indicator pt-minimal"
                content={<span style={{fontSize: '0.75em'}}>{item.text}</span>}>
               {(item.icon) ? <span className={`pt-icon-standard ${item.icon}`}></span> :  item.text }
            </Tooltip>


					</button>);
				})}
			</div>
		);
	}

});

export default TableMenu;

styles = {
	container: function(top, left) {
		const width = 175;
		return {
			zIndex: 10,
			width: `${width}px`,
			position: 'absolute',
			height: '30px',
			lineHeight: '30px',
			padding: '0px',
			textAlign: 'center',
			top: top - 40,
			left: Math.max(left - (width / 2), -50),
			overflow: 'hidden',
		};
	},
	button: {
		minWidth: '5px',
		padding: '0px 7px',
		fontSize: '1.1em',
		outline: 'none',
		borderRadius: '0px',
		color: 'rgba(255, 255, 255, 0.7)',
	},
	active: {
		color: 'rgba(255, 255, 255, 1)',
	},
};
