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
		handleFileUpload: PropTypes.func,
		handleReferenceAdd: PropTypes.func,
	},

	getInitialState() {
		return {
			openDialog: undefined,
			callback: undefined,
		};
	},

	openDialog: function(dialogType, callback) {
		console.log('hi', dialogType, callback);
		this.setState({ 
			openDialog: dialogType,
			callback: callback 
		});
	},

	closeDialog: function() {
		this.setState({ 
			openDialog: undefined,
			callback: undefined,
		});
	},

	onFileSelect: function(evt) {
		const file = evt.target.files[0];
		console.log(file);
		evt.target.value = null;
		this.props.handleFileUpload(file, (filename)=>{
			console.log('Going to insert filename');
			this.state.callback(filename); // This shouldn't use the callback - it should import the function rom insertMenu and call it.

			this.setState({ 
				openDialog: undefined,
				callback: undefined,
			});
		});
		// Need to upload file
		// Need to add new file object to file list
		// Need to insert file content into editor
		
	},

	onReferenceAdd: function(item) {
		console.log(item);
		// Need to update or create bibtex file
		// Need to make sure that updated file is sent to editor props
		// Need to call inserReference function 
		this.props.handleReferenceAdd(item, (itemToAdd)=> {

			console.log('Going to insert reference');
			this.state.callback(itemToAdd);
			this.setState({ 
				openDialog: undefined,
				callback: undefined,
			});
		});
		
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
