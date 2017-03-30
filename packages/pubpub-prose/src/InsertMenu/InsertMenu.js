import React, { PropTypes } from 'react';
import { Popover, PopoverInteractionKind, Position, Menu, MenuItem } from '@blueprintjs/core';
import getMenuItems from './insertMenuConfig';
import InsertMenuDialogFiles from './InsertMenuDialogFiles';
import InsertMenuDialogReferences from './InsertMenuDialogReferences';

let styles;

export const InsertMenu = React.createClass({
	propTypes: {
		editor: PropTypes.object,
		top: PropTypes.number,
	},

	getInitialState() {
		return {
			openDialog: undefined,
		};
	},

	openDialog: function(dialogType, callback) {
		console.log('hi', dialogType, callback);
		this.setState({ openDialog: dialogType });
	},

	closeDialog: function() {
		this.setState({ openDialog: undefined });
	},

	onFileSelect: function(evt) {
		console.log(evt.target.files[0]);
		evt.target.value = null;
		this.setState({ openDialog: undefined });
	},

	onReferenceAdd: function(item) {
		console.log(item);
		this.setState({ openDialog: undefined });
	},

	render: function() {
		const menuItems = getMenuItems(this.props.editor, this.openDialog);

		return (
			<div style={styles.container(this.props.top)}>
				<Popover 
					content={
						<Menu>
							{menuItems.map((item)=> {
								return <MenuItem onClick={item.run} text={item.text} />;
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

				<InsertMenuDialogFiles 
					isOpen={this.state.openDialog === 'files'} 
					onClose={this.closeDialog} 
					onFileSelect={this.onFileSelect} />

				<InsertMenuDialogReferences 
					isOpen={this.state.openDialog === 'references'} 
					onClose={this.closeDialog} 
					onReferenceAdd={this.onReferenceAdd}/>
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
