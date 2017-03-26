import { Button, Dropdown, Intent, Menu, MenuItem, Popover, PopoverInteractionKind, Position, Toaster } from '@blueprintjs/core';
import React, {PropTypes} from 'react';
import { getPlugin, getPluginState } from '../prosemirror-setup/plugins';

import BasePrompt from './basePrompt';
import FileDialog from './fileDialog';
import ReferenceDialog from './referenceDialog'

let styles = {};

export const BaseMenu = React.createClass({
	propTypes: {
    onClose: PropTypes.func,
	},
	getInitialState: function() {
		return {};
	},

	buildMenu: function(menu, filter) {
		const loopFunc = (menuItem) => {
			if (Array.isArray(menuItem)) {
				return this.buildMenu(menuItem, true);
			} else if  (menuItem.content && menuItem.content.length > 0)  {
				const items = this.buildMenu(menuItem.content, true);
				if (items.length === 0) {
					return false;
				}
			} else if (menuItem.spec) {
				const spec = menuItem.spec;
				if (spec.select && !spec.select(this.props.view.state)) {
					 return false;
				}
			}
			return true;
		};

		return (filter) ?  menu.filter(loopFunc) : menu.map(loopFunc);
	},

	showError: function(message) {
		this.refs.errorToast.show({ message, intent: Intent.DANGER });
	},

	renderMenu: function(menu, inDropdown=false) {
		const editorState = this.props.view.state;

		let menuItems = menu.map((menuItem) => {
			if (Array.isArray(menuItem)) {
				const m = this.renderMenu(menuItem);
				m.concat((<div className="editorMenuSeperator"></div>));
				return m;
			} else if (menuItem.content && menuItem.content.length > 0)  {
				let renderedSubMenu = this.renderMenu(menuItem.content, true);
				renderedSubMenu = renderedSubMenu.filter((subItem) => {
					return (subItem && !subItem.props.disabled)
				});
				if (menuItem.options.hideOnDisable === true && renderedSubMenu.length === 0) {
					return null;
				}
				const popoverContent = (
					<Menu>
            {this.renderMenu(menuItem.content, true)}
          </Menu>
				);
				const findActiveItems = (menuItems) => {
					for (const subMenu of menuItems) {
						if (subMenu.spec && subMenu.spec.active) {
							 const active = subMenu.spec.active(editorState);
							 if (active) {
								 return subMenu;
							 }
						}
					}
					return null;
				};
				const activeItem = findActiveItems(menuItem.content);
				const label = (activeItem) ? activeItem.spec.label : menuItem.options.label;
				const className = (menuItem.options.className) ? menuItem.options.className : '';
				const icon = (menuItem.options.icon) ? menuItem.options.icon : null;
				return (<Popover key={label} content={popoverContent}
                     interactionKind={PopoverInteractionKind.CLICK}
                     popoverClassName={`pt-popover-content-sizing pt-minimal editorMenuPopover`}
										 className={`${className}`}
                     position={Position.BOTTOM_LEFT}
                     useSmartPositioning={false}>
						 <a className={`pt-button pt-icon-${icon}`} tabIndex="0" role="button">
							 {label} <span className="pt-icon-standard pt-icon-caret-down pt-align-right"></span>
						</a>
        </Popover>);
			} else {
				const run = this.runSpec.bind(this, menuItem.spec);
				const title = menuItem.spec.title;
				const text = (!menuItem.spec.icon || inDropdown) ? menuItem.spec.title : null;
				const icon = (menuItem.spec.icon) ? menuItem.spec.icon : null;
				const active = (menuItem.spec.select) ? menuItem.spec.select(editorState) : true;
				if (!active && menuItem.spec.hideOnDisable === true) {
					return null;
				}
				if (inDropdown) {
					const level = (menuItem.spec.attrs && menuItem.spec.attrs) ? menuItem.spec.attrs.level : 0;
					const levels = {
						1: 2.3,
						2: 2,
						3: 1.7,
						4: 1.3,
					};
					const buttonStyle = {
						fontSize: `${levels[level]}em`,
						lineHeight: `${levels[level]}em`,
					};
					return (<div disabled={!active} style={buttonStyle}><MenuItem disabled={!active} iconName={icon} onClick={run} text={text}/> </div>);
				} else {
					const buttonStyle = {};
					if (!text) {
						buttonStyle.maxWidth = 50;
						buttonStyle.width = 40;
					}
					return (<Button disabled={!active} style={buttonStyle} iconName={icon} onClick={run}>{text}</Button>);
				}
			}
		});
		return menuItems;

	},

	insertFile({url, filename}) {
		this.state.dialogSpec.run(this.props.view.state, this.props.view.dispatch, this.props.view, {url, filename});
		this.setState({dialogSpec: null, dialogType: null, dialogExtension: null});
	},

	saveFile({url, filename, type}) {
		this.state.dialogSpec.run(this.props.view.state, this.props.view.dispatch, this.props.view, {url, filename});
		if (this.props.createFile) {
			this.props.createFile({url, filename, type});
		}
		this.setState({dialogSpec: null, dialogType: null, dialogExtension: null});
	},

	saveReference(referenceData) {
		this.state.dialogSpec.run(this.props.view.state, this.props.view.dispatch, this.props.view, referenceData);
		this.setState({dialogSpec: null, dialogType: null, dialogExtension: null});
	},

	saveLink(linkData) {
		this.state.dialogSpec.run(linkData);
		this.setState({dialogSpec: null, dialogType: null, dialogExtension: null});
	},

	saveTable(tableData) {
		this.state.dialogSpec.run(this.props.view.state, this.props.view.dispatch, this.props.view, tableData);
		this.setState({dialogSpec: null, dialogType: null, dialogExtension: null});
	},

	runSpec: function(spec) {
		if (spec.dialogType) {
			if (spec.dialogCallback) {
				const openPrompt = ({callback}) => {
					const newSpec = {run: callback};
					this.setState({ dialogSpec: newSpec, dialogType: spec.dialogType, dialogExtension: spec.dialogExtension });
				};
				spec.run(this.props.view.state, this.props.view.dispatch, this.props.view, openPrompt);
			} else {
				this.setState({ dialogSpec: spec, dialogType: spec.dialogType, dialogExtension: spec.dialogExtension });
			}
			return;
		}
		spec.run(this.props.view.state, this.props.view.dispatch, this.props.view);
	},

	onClose: function() {
		this.setState({dialogSpec: null, dialogType: null, dialogExtension: null});
	},

	getExisting: function() {
		const citations = getPluginState('citations', this.view.state);
	},

	getFiles: function() {
		const filesPlugin = getPlugin('relativefiles', this.props.view.state);
		if (filesPlugin && filesPlugin.props) {
			const files = filesPlugin.props.getAllFiles({state: this.props.view.state});
			return files;
		}
		return {};
	},

	preventClick: function(evt) {
		evt.preventDefault();
	},

  renderDisplay() {
		const renderedMenu = this.buildMenu(this.props.menu);
		const editorState = this.props.view.state;
    return (
      <div className="editorWrapper" onClick={this.preventClick}>
			<Toaster position={Position.TOP} ref={'errorToast'} />

			<div className="pt-button-group editorMenu">
			  {this.renderMenu(this.props.menu)}
			</div>
			{(this.state.dialogType === 'file') ?
				<FileDialog files={this.getFiles()} editorState={editorState} onClose={this.onClose} insertFile={this.insertFile} saveFile={this.saveFile} open={true}/>
				: null
			}

			{(this.state.dialogType === 'image') ?
				<FileDialog type={'image'} files={this.getFiles()} editorState={editorState} onClose={this.onClose} insertFile={this.insertFile} saveFile={this.saveFile} open={true}/>
				: null
			}


			{(this.state.dialogType === 'video') ?
				<FileDialog type={'video'} files={this.getFiles()} editorState={editorState} onClose={this.onClose} insertFile={this.insertFile} saveFile={this.saveFile} open={true}/>
				: null
			}

			{(this.state.dialogType === 'reference') ?
				<ReferenceDialog onClose={this.onClose} saveReference={this.saveReference} open={true}/>
				: null
			}
			{(this.state.dialogType === 'link') ?
				<BasePrompt type="link" onClose={this.onClose} savePrompt={this.saveLink}/>
				: null
			}
			{(this.state.dialogType === 'table') ?
				<BasePrompt type="table"  onClose={this.onClose} savePrompt={this.saveTable}/>
				: null
			}
			</div>

    );
  },

	rerender: function() {
		this.forceUpdate();
	},

  render: function() {
    const {editing} = this.state;
		return this.renderDisplay();
	}
});

export default BaseMenu;
