import React, { PropTypes } from 'react';

import getMenuItems from './formattingMenuConfig';

let styles;

export const FormattingMenu = React.createClass({
	propTypes: {
		editor: PropTypes.object,
		top: PropTypes.number,
		left: PropTypes.number,
	},
	getInitialState: function() {
		return { input: null };
	},

	startInput: function(type, run) {
		this.setState({ input: 'text', run });
	},

	submitInput: function(evt) {
		if (evt.key === 'Enter') {
			const link = this.textInput.value;
			this.state.run({ href: link });
			this.setState({ input: null, run: null });
		}
	},

	renderTextInput() {
		return (<div onKeyPress={this.submitInput} className={'pt-card pt-elevation-0 pt-dark'} style={styles.container(this.props.top, this.props.left, 200)}>
			<input style={styles.textInput} ref={(input) => { this.textInput = input; }} className="pt-input" type="text" placeholder="link" dir="auto" />
		</div>);
	},

	render: function() {
		const menuItems = getMenuItems(this.props.editor);
		const { input } = this.state;

		if (input === 'text') {
			return this.renderTextInput();
		}

		return (
			<div className={'pt-card pt-elevation-0 pt-dark'} style={styles.container(this.props.top, this.props.left, 400)}>
				{menuItems.map((item, index)=> {
					let onClick;
					if (item.input === 'text' && !item.isActive) {
						onClick = this.startInput.bind(this, item.input, item.run);
					} else {
						onClick = item.run;
					}
					return <button key={`menuItem-${index}`} className={'pt-button pt-minimal'} style={item.isActive ? { ...styles.button, ...styles.active } : styles.button} onClick={onClick}>{item.text}</button>;
				})}

			</div>
		);
	}

});

export default FormattingMenu;

styles = {
	textInput: {
		height: '80%',
		verticalAlign: 'baseline',
	},
	container: function(top, left, width) {
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
