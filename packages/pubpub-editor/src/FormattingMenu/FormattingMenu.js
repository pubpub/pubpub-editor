import React, { PropTypes } from 'react';

import getMenuItems from './formattingMenuConfig';

let styles;
require('../../style/fonts.scss');

export const FormattingMenu = React.createClass({
	propTypes: {
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

	onCursorChange() {
		this.onChange();
	},

	onChange: function() {
		const { view, containerId } = this.context;

		const currentPos = view.state.selection.$to.pos;
		const currentNode = view.state.doc.nodeAt(currentPos - 1);
		const container = document.getElementById(containerId);

		if (!view.state.selection.$cursor && currentNode && currentNode.text) {
			const currentFromPos = view.state.selection.$from.pos;
			const currentToPos = view.state.selection.$to.pos;
			const left = view.coordsAtPos(currentFromPos).left - container.getBoundingClientRect().left;
			const right = view.coordsAtPos(currentToPos).right - container.getBoundingClientRect().left;
			const inlineCenter = left + ((right - left) / 2);
			const inlineTop = view.coordsAtPos(currentFromPos).top - container.getBoundingClientRect().top;
			return this.setState({
				left: inlineCenter,
				top: inlineTop,
			});
		}

		return this.setState({
			left: 0,
			top: 0,
		});
	},


	renderTextInput() {
		const { top, left } = this.state;
		return (<div onKeyPress={this.submitInput} className={'pt-card pt-elevation-0 pt-dark'} style={styles.container(top, left, 200)}>
			<input style={styles.textInput} ref={(input) => { this.textInput = input; }} className="pt-input" type="text" placeholder="link" dir="auto" />
		</div>);
	},

	render: function() {

		const { input, left, top } = this.state;
		const { view } = this.context;

		const menuItems = getMenuItems(view);

		if (input === 'text') {
			return this.renderTextInput();
		}

		return (
			<div className={'pt-card pt-elevation-0 pt-dark popover-up'} style={styles.container(top, left, 400)}>
				{menuItems.map((item, index)=> {
					// return <button key={`menuItem-${index}`} className={'pt-button pt-minimal'} style={item.isActive ? { ...styles.button, ...styles.active } : styles.button} onClick={item.run}>{item.text}</button>;
					// return <button key={`menuItem-${index}`} className={`pt-button pt-minimal ${item.icon}`} style={item.isActive ? { ...styles.button, ...styles.active } : styles.button} onClick={item.run} />;
					let onClick;
					if (item.input === 'text' && !item.isActive) {
						onClick = this.startInput.bind(this, item.input, item.run);
					} else {
						onClick = item.run;
					}
					return <button key={`menuItem-${index}`} className={`pt-button pt-minimal ${item.icon}`} style={item.isActive ? { ...styles.button, ...styles.active } : styles.button} onClick={onClick} />;
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
		if (!top) {
			return {
				display: 'none'
			};
		}
		return {
			transition: 'left 0.25s, top 0.1s',
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
