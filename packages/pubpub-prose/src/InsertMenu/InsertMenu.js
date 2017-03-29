import React, { PropTypes } from 'react';
import { Popover, PopoverInteractionKind, Position, Menu, MenuItem } from '@blueprintjs/core';
import getMenuItems from './insertMenuConfig';

let styles;

export const InsertMenu = React.createClass({
	propTypes: {
		editor: PropTypes.object,
		top: PropTypes.number,
	},

	render: function() {
		const menuItems = getMenuItems(this.props.editor);

		return (
			<div style={styles.container(this.props.top)}>
				<Popover 
					content={
						<Menu>
							{menuItems.map((item)=> {
								return <MenuItem text={item.text} onClick={item.run} />
							})}
						</Menu>
					}
					interactionKind={PopoverInteractionKind.CLICK}
					popoverClassName="pt-minimal pt-popover-dismiss"
					position={Position.BOTTOM_LEFT}
					inline={true}
					useSmartPositioning={false}>
					<button className={'pt-button pt-minimal pt-icon-insert'} />
				</Popover>
			</div>
		);
	}

});

export default InsertMenu;

styles = {
	container: function(top) {
		return {
			position: 'absolute', 
			left: '-35px',
			top: top - 8,
		};
	},
};
