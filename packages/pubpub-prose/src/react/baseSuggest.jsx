import React, {PropTypes} from 'react';

import Autosuggest from 'react-autosuggest';

require('../../style/autosuggest.scss');

export const SuggestComponent = React.createClass({
	propTypes: { },
	getInitialState() {
		return { suggestionCategory: null, renderedSuggestions: [] };
	},

	getDefaultProps: function() {
	},

  componentDidMount: function() {
  },

  focus: function() {
    this.refs.suggest.input.focus();
  },

	setSelected: function(selected) {

	},

	componentWillUnmount: function() {
	},

  handleKeyPress: function(e) {
     if (e.key === 'Enter' && !this.props.block) {
			const {text, type, meta} = this.state;
			// this.refs.input.blur();
			this.props.updateMention({text, type, meta});
     }
  },


  handleChange: function(event, {newValue}) {
    const value = newValue;
		if (value.length === 0) {
			this.props.revertToText();
			return;
		}
		this.setState({text: newValue, type: 'file', meta: {}});
    // this.props.updateMention({text: value, type: 'file', meta: {}});
  },


  changeToNormal: function() {
    this.setState({editing: false});
  },

	getAutocompleteContent: function() {
		const results = ['a', 'b'];
	},

	getSuggestions({value, suggestionCategory, suggestions}) {

		const inputValue = value.trim().toLowerCase();
		const inputLength = inputValue.length;

		let suggestionsSource;

		if (suggestionCategory === null && !!suggestions[value]) {
			return suggestions[value];
		} else if (suggestionCategory === null) {
			suggestionsSource = Object.keys(suggestions);
		} else {
			suggestionsSource = suggestions[suggestionCategory];
		}

		const filteredSuggestions = inputLength === 0 ? suggestionsSource : suggestionsSource.filter(lang =>
			lang.toLowerCase().slice(0, inputLength) === inputValue
		);

		return filteredSuggestions;
	},

	onSuggestionsFetchRequested({ value }) {
		const { suggestions } = this.props;
		const { suggestionCategory } = this.state;

		const filteredSuggestions = this.getSuggestions({value, suggestionCategory, suggestions});
		console.log('Fetched suggestions!');
		this.setState({renderedSuggestions: filteredSuggestions})
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
			const { suggestions } = this.props;
			const renderedSuggestions = this.getSuggestions({value: '', suggestionCategory: suggestion, suggestions});
			console.log('Set suggestions!');
			this.setState({suggestionCategory: suggestion, text: '', renderedSuggestions});
		} else {
			this.props.updateMention({text: suggestion, type: 'file', meta: {}});
		}
	},

  render() {
    const { suggestions } = this.props;
		const { suggestionCategory, renderedSuggestions } = this.state;
		const text = this.state.text || this.props.text || '';

		const shouldRenderSuggestions = (suggestionCategory !== null);

		const inputProps = {
      placeholder: 'Type a programming language',
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
