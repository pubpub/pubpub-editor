import React, {PropTypes} from 'react';

import Autosuggest from 'react-autosuggest';
import katexStyles from './katex.css.js';

let styles = {};

export const MentionComponent = React.createClass({
	propTypes: { },
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
      this.changeToNormal();
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

	onSuggestionsFetchRequested({ value }) {
		return;
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

  renderEdit() {
    const {clientWidth} = this.state;
    const {block} = this.props;
		const text = this.state.text || this.props.text;

		const files = ['A', 'B', 'C'];

		const inputProps = {
      placeholder: 'Type a programming language',
      value: text,
      onChange: this.handleChange
    };

    return (
				<Autosuggest
					ref={'suggest'}
        	suggestions={files}
					onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
					onSuggestionsClearRequested={this.onSuggestionsClearRequested}
					getSuggestionValue={this.getSuggestionValue}
					renderSuggestion={this.renderSuggestion}
					inputProps={inputProps}
      	/>
    );
  },


  render: function() {
    const {editing} = this.state;
    if (editing) {
      return this.renderEdit();
    }
		return this.renderDisplay();
	}
});

styles = {
  wrapper: {
    backgroundColor: 'blue',
  },
  display: {

  },
  editing: function({clientWidth}) {
    return {
      display: 'inline',
      minWidth: '100px',
      fontSize: '12px',
      margin: '0px',
      padding: '0px',
      lineHeight: '1em',
      border: '2px solid #BBBDC0',
      borderRadius: '2px',
    }
  },
};

export default MentionComponent;
