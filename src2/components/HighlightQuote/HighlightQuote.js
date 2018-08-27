/* eslint-disable react/no-danger */
import React, { Component } from 'react';
import PropTypes from 'prop-types';

require('./highlightQuote.scss');

const propTypes = {
	attrs: PropTypes.object.isRequired,
	options: PropTypes.object.isRequired,
	isSelected: PropTypes.bool.isRequired,
	isEditable: PropTypes.bool.isRequired,
};

class HighlightQuote extends Component {
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
		const attrs = this.props.attrs;
		const options = this.props.options;
		if (!attrs.exact) { return null; }
		const scrollToClicked = ()=> {
			// console.log(attrs.id);
			const thing = document.getElementsByClassName(attrs.id)[0];
			if (thing) {
				thing.scrollIntoView({ behavior: 'smooth' });
			} else if (options.handlePermalink) {
				options.handlePermalink({
					to: attrs.to,
					from: attrs.from,
					version: attrs.version,
					section: attrs.section,
				});
			} else {
				this.setState({ removed: true });
			}
		};
		return (
			<div className={`pt-card pt-elevation-2 highlight-quote ${this.props.isSelected ? 'isSelected' : ''}`}>
				{!this.props.isEditable && !this.state.removed && !options.hideScrollButton &&
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
					<style>{`.${attrs.id} { background-color: ${options.hoverBackgroundColor} !important; }`}</style>
				}
				<div className={'quote-text'}>
					{attrs.prefix}
					<span className={'highlight-text'}>{attrs.exact}</span>
					{attrs.suffix}
				</div>
			</div>
		);
	}
}

HighlightQuote.propTypes = propTypes;
export default HighlightQuote;
