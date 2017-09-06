import { Menu, MenuItem, Popover, PopoverInteractionKind, Position } from '@blueprintjs/core';
import React, { PropTypes } from 'react';
import getMenuItems , { canUseInsertMenu, insertEmbed, insertReference } from './insertMenuConfig';

import InsertMenuDialogFiles from './InsertMenuDialogFiles';
import InsertMenuDialogReferences from './InsertMenuDialogReferences';

let styles;

export const InsertMenu = React.createClass({
	propTypes: {
		editor: PropTypes.object,
		top: PropTypes.number,
		handleFileUpload: PropTypes.func,
		handleReferenceAdd: PropTypes.func,
		allReferences: PropTypes.array,
	},

	getInitialState() {
		return {
			openDialog: undefined,
			callback: undefined,
			top: null,
		};
	},

	onCursorChange() {
		this.onChange();
	},

	onChange() {
		const { view, containerId } = this.context;1
		const container = document.getElementById(containerId);
		const canUse = canUseInsertMenu(view);
		const sel = view.state.selection;
		const currentPos = sel.$to.pos;


		if (sel.empty && canUse) {
			this.setState({ top: view.coordsAtPos(currentPos).top - container.getBoundingClientRect().top + 5 });
		} else {
			this.setState({ top: null });
		}
	},

	openDialog: function(dialogType, callback) {
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
		// Need to upload file
		// Need to add new file object to file list
		// Need to insert file content into editor
		const file = evt.target.files[0];
		evt.target.value = null;
		this.props.handleFileUpload(file, (filename, url)=>{
			// insertEmbed(filename);
			this.state.callback(filename, url); // This shouldn't use the callback - it should import the function rom insertMenu and call it.

			this.setState({
				openDialog: undefined,
				callback: undefined,
			});
		});
	},

	onReferenceAdd: function(item) {
		// Need to update or create bibtex file
		// Need to make sure that updated file is sent to editor props
		// Need to call inserReference function

		const existingReference = this.props.allReferences.find((reference) => {
			if (reference.id === item.id) {
				return true;
			}
			return false;
		});


		if (existingReference) {
			this.state.callback(item);
			this.setState({
				openDialog: undefined,
				callback: undefined,
			});
			return;
		}

		this.props.handleReferenceAdd(item, (itemToAdd)=> {
			this.setState({
				openDialog: undefined,
				callback: undefined,
			});
			this.state.callback(itemToAdd);
		});

	},

	render: function() {
		const { view } = this.context;
		const { top } = this.state;

		const menuItems = getMenuItems(view, this.openDialog);

		if (!top) {
			return null;
		}

		return (
			<div style={styles.container(top)}>
				<Popover
					content={
						<Menu>
							{menuItems.map((item, index)=> {
								return <MenuItem key={`insert-menu-${index}`} onClick={item.run} text={item.text} />;
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
					onReferenceAdd={this.onReferenceAdd} />
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
