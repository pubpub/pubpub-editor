import React, {PropTypes} from 'react';

import Autosuggest from 'react-autosuggest';

require('../../style/autosuggest.scss');

export const SuggestComponent = React.createClass({
	propTypes: { },
	getInitialState() {
		return { suggestionCategory: null, renderedSuggestions: [] };
	},

  focus: function() {
    this.refs.suggest.input.focus();
  },

  handleKeyPress: function(e) {
     if (e.key === 'Enter') {
			const {text} = this.state;
			this.props.onSelected(text);
     }
  },

  handleChange: function(event, {newValue}) {
    const value = newValue;
		if (value.length === 0) {
			this.props.onCancel();
			return;
		}
		this.setState({text: newValue});
  },


	// Either searches through the list of suggestionsCategories or calls
	// getSuggestionsByCategory to fetch the data within a category
	// All results are filtered to match the value`
	getSuggestions({value, suggestionCategory}) {

		return new Promise((resolve, reject) => {

			const {getSuggestionsByCategory, suggestionCategories} = this.props;

			const inputValue = value.trim().toLowerCase();
			const inputLength = inputValue.length;

			let suggestionsSource;
			let shouldFilter = true;

			// a hack for the edgecase where you've selected a value but the state of suggestionCategory hasn't updated yet
			// in this case, check if the value is the same as a category, and if so, use that as the category
			if (suggestionCategory === null && suggestionCategories.indexOf(value) !== -1) {
				shouldFilter = false;
				suggestionsSource = getSuggestionsByCategory({value, suggestionCategory: value});
			} else if (suggestionCategory === null) {
				suggestionsSource = Promise.resolve(suggestionCategories);
			} else {
				suggestionsSource = getSuggestionsByCategory({value, suggestionCategory});
			}

			suggestionsSource.then((suggestionResults) => {
				if (shouldFilter) {
					const filteredSuggestions = inputLength === 0 ? suggestionResults : suggestionResults.filter(lang =>
						lang.toLowerCase().slice(0, inputLength) === inputValue
					);
					resolve(filteredSuggestions);
				} else {
					resolve(suggestionResults);
				}
			});

		});
	},

	onSuggestionsFetchRequested({ value }) {
		const { suggestionCategory } = this.state;

		this.getSuggestions({value, suggestionCategory}).then((filteredSuggestions) => {
			this.setState({renderedSuggestions: filteredSuggestions});
		});

	},

	// Autosuggest will call this function every time you need to clear suggestions.
	onSuggestionsClearRequested() {
		this.setState({
			suggestions: []
		});
	},

	getSuggestionValue(suggestion) {
		return suggestion;
	},

	renderSuggestion(suggestion) {
		return (<div>{suggestion}</div>);
	},

	renderInputComponent(inputProps){
		return (
	  	<span>
	    	<input ref={(input) => { this.textInput = input; }} {...inputProps} />
	  	</span>
		);
	},

	onSuggestionSelected(event, { suggestion, suggestionValue, suggestionIndex, sectionIndex, method }) {
		if (this.state.suggestionCategory === null) {
			this.setState({suggestionCategory: suggestion, text: ''});
		} else {
			this.props.onSelected(suggestion);
			this.setState({suggestionCategory: null, text: '', renderedSuggestions: []});
		}
	},

  render() {
		const { suggestionCategory, renderedSuggestions } = this.state;
		const text = this.state.text || this.props.text || '';

		const shouldRenderSuggestions = (suggestionCategory !== null);

		const inputProps = {
      placeholder: '',
      value: text,
      onChange: this.handleChange
    };

    return (
			<span>
				<Autosuggest
					ref={'suggest'}
        	suggestions={renderedSuggestions}
					onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
					onSuggestionsClearRequested={this.onSuggestionsClearRequested}
					getSuggestionValue={this.getSuggestionValue}
					renderSuggestion={this.renderSuggestion}
					onSuggestionSelected={this.onSuggestionSelected}
					alwaysRenderSuggestions={true}
					inputProps={inputProps}
      	/>
			</span>
    );
  },


});

export default SuggestComponent;
