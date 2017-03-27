import React, { PropTypes } from 'react';

import ReactDOM from 'react-dom';
import SuggestComponent from '../src/editorComponents/Autocomplete';

export const StorybookAutocomplete = React.createClass({
  getInitialState: function() {
    return {value: ''};
  },
  onSelected: function(suggestion) {
    this.setState({value: suggestion});
  },
  onCancel: function() {
    this.setState({value: ''});
  },
	render: function() {
    const {value} = this.state;

		const suggestionCategories = ['files', 'references', 'users', 'figures'];
		const getSuggestionsByCategory = function ({value, suggestionCategory}) {
			// this will automatically be filtered
			return new Promise((resolve, reject) => {
				let result;
				switch (suggestionCategory) {
					case 'files':
						result = ['A.jpg','B.jpg'];
						break;
					case 'references':
						result = ['Design & Science - Joi Ito','Design as Participation - Kevin Slavin'];
						break;
					case 'users':
						result = ['Thariq', 'Travis', 'Hassan'];
						break;
					case 'figures':
						result = ['Figure 1', 'Figure 2'];
						break;
				}
				resolve(result);
			});
		};

		return (
      <div>
  			<div>Autocomplete value: <strong>{(value) ? value : 'Not Selected'}</strong></div>
  			{/*<Autocomplete
  				ref="suggest"
  				onCancel={this.onCancel}
  				onSelected={this.onSelected}
  				suggestionCategories={suggestionCategories}
  				getSuggestionsByCategory={getSuggestionsByCategory} />*/}
      </div>
		);
	}
});

export default StorybookAutocomplete;
