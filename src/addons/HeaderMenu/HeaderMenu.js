import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Popover, PopoverInteractionKind, Position } from '@blueprintjs/core';
import getMenuItems from './headerMenuConfig';
import { getMenuItems as getInsertItems, canUseInsertMenu } from '../InsertMenu/insertMenuConfig';

require('./headerMenu.scss');

const propTypes = {
	include: PropTypes.array,
	containerId: PropTypes.string,
	view: PropTypes.object,
	editorState: PropTypes.object,
};

const defaultProps = {
	include: [],
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
* Displays a formatting menu at the top of the editor for formatting and insert.
*
* @prop {array} [include] An array of the menu items that should be included in the menu. Allowed options are: 'header1', 'header2', 'bold', 'italic', 'code', 'subscript', 'superscript', 'strikethrough', 'blockquote', 'bullet-list', 'numbered-list', and 'link'
*
* @example
return (
	<Editor>
 		<HeaderMenu include={['bold', 'link']}/>
	</Editor>
);
*/
class HeaderMenu extends Component {
	render() {
		const menuItems = getMenuItems(this.props.view).filter((item)=> {
			if (this.props.include.length === 0) { return true; }
			return this.props.include.indexOf(item.title) > -1;
		});

		const insertItems = getInsertItems(this.props.view);

		return (
			<div className="header-menu">
				{menuItems.map((item)=> {
					const onClick = ()=> {
						item.run();
						this.props.view.focus();
					};
					return (
						<div
							role={'button'}
							tabIndex={-1}
							key={`menuItem-${item.icon}`}
							className={`button ${item.icon} ${item.isActive ? 'active' : ''}`}
							onClick={onClick}
						/>
					);
				})}
				<Popover
					interactionKind={PopoverInteractionKind.CLICK}
					position={Position.BOTTOM_LEFT}
					popoverClassName="pt-minimal"
					transitionDuration={-1}
					inheritDarkTheme={false}
					tetherOptions={{
						constraints: [{ attachment: 'together', to: 'window' }]
					}}
					content={
						<ul className="pt-menu">
							{insertItems.sort((foo, bar)=> {
								if (foo.label < bar.label) { return -1; }
								if (foo.label > bar.label) { return 1; }
								return 0;
							}).map((item, index)=> {
								return (
									<li key={`menu-item-${item.label}`}>
										<a
											className={`pt-menu-item pt-popover-dismiss ${item.icon || ''}`}
											onClick={()=> {
												item.run();
												setTimeout(()=> {
													/* Setting focus synchornously seems to  */
													/* be incorrect and set the focus on the */
													/* 'previous' view. It causes weird cursor */
													/* behavior. Asynchronous seems to fix it. */
													this.props.view.focus();	
												}, 0);
												
											}}
										>
											{item.label}
										</a>
									</li>
								);
							})}
						</ul>
					}
				>
					<button type="button" className="dropdown-button pt-button pt-minimal">
						Insert
						<span className="pt-icon-standard pt-icon-caret-down pt-align-right" />
					</button>
				</Popover>
			</div>
		);
	}
}

HeaderMenu.propTypes = propTypes;
HeaderMenu.defaultProps = defaultProps;
export default HeaderMenu;
