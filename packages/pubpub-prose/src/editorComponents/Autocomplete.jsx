import React, {PropTypes} from 'react';

require('../../style/autosuggest.scss');

export const Autocomplete = React.createClass({
	propTypes: {
		style: PropTypes.object,
		URLs: PropTypes.object,
		input: PropTypes.string,
		onSelection: PropTypes.func,
	},

	getInitialState() {
		return { 
			suggestionCategory: null, 
			renderedSuggestions: [] 
		};
	},

	render() {
		return (
			<div className={'pt-card pt-elevation-4'} style={this.props.style}>
				{this.props.input}
			</div>
		);
	},
});

export default Autocomplete;
