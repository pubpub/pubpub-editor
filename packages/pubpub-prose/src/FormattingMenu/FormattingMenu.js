import React, { PropTypes } from 'react';
import getMenuItems from './formattingMenuConfig';

let styles;
require('../../style/fonts.scss');

export const FormattingMenu = React.createClass({
	propTypes: {
		editor: PropTypes.object,
		top: PropTypes.number,
		left: PropTypes.number,
	},

	render: function() {
		const menuItems = getMenuItems(this.props.editor);

		return (
			<div className={'pt-card pt-elevation-0 pt-dark'} style={styles.container(this.props.top, this.props.left)}>
				{menuItems.map((item, index)=> {
					// return <button key={`menuItem-${index}`} className={'pt-button pt-minimal'} style={item.isActive ? { ...styles.button, ...styles.active } : styles.button} onClick={item.run}>{item.text}</button>;
					return <button key={`menuItem-${index}`} className={`pt-button pt-minimal ${item.icon}`} style={item.isActive ? { ...styles.button, ...styles.active } : styles.button} onClick={item.run} />;
				})}
				
			</div>
		);
	}

});

export default FormattingMenu;

styles = {
	container: function(top, left) {
		const width = 350;
		return {
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
