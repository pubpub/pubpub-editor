import React, { Component } from 'react';
import PropTypes from 'prop-types';

require('./highlightQuote.scss');

const propTypes = {
	to: PropTypes.number,
	from: PropTypes.number,
	id: PropTypes.string,
	exact: PropTypes.string,
	suffix: PropTypes.string,
	prefix: PropTypes.string,
	version: PropTypes.string,
	isSelected: PropTypes.bool,
	isEditable: PropTypes.bool,
	hoverBackgroundColor: PropTypes.string.isRequired,
	hideScrollButton: PropTypes.bool,
};

const defaultProps = {
	to: undefined,
	from: undefined,
	id: undefined,
	exact: undefined,
	suffix: undefined,
	prefix: undefined,
	version: undefined,
	isSelected: false,
	isEditable: false,
	hideScrollButton: false,
};

class Highlight extends Component {
	constructor(props) {
		super(props);
		this.state = {
			active: false,
			removed: false,
		};
		this.handleMouseEnter = this.handleMouseEnter.bind(this);
		this.handleMouseLeave = this.handleMouseLeave.bind(this);
	}
	handleMouseEnter() {
		this.setState({ active: true });
	}
	handleMouseLeave() {
		this.setState({ active: false });
	}
	render() {
		if (!this.props.exact) { return null; }
		const scrollToClicked = ()=> {
			// console.log(this.props.id);
			const thing = document.getElementsByClassName(this.props.id)[0];
			if (thing) {
				thing.scrollIntoView({ behavior: 'smooth' });
			} else {
				this.setState({ removed: true });
			}
		};
		return (
			<div className={`pt-card pt-elevation-2 highlight-quote ${this.props.isSelected ? 'isSelected' : ''}`}>
				
				{!this.props.isEditable && !this.state.removed && !this.props.hideScrollButton &&
					<button
						className={'scroll-to-button pt-button pt-small pt-icon-highlight'}
						onClick={scrollToClicked}
						onMouseEnter={this.handleMouseEnter}
						onMouseLeave={this.handleMouseLeave}
					/>
				}
				{!this.props.isEditable && this.state.removed &&
					<button className={'scroll-to-button pt-button pt-small'} disabled>
						Highlight Not Found
					</button>
				}
				{this.state.active &&
					<style>{`.${this.props.id} { background-color: ${this.props.hoverBackgroundColor} !important; }`}</style>
				}
				<div className={'quote-text'}>
					{this.props.prefix}
					<span className={'highlight-text'}>{this.props.exact}</span>
					{this.props.suffix}
				</div>
			</div>
		);
	}
}

Highlight.propTypes = propTypes;
Highlight.defaultProps = defaultProps;
export default Highlight;
