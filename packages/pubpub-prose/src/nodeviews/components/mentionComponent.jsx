import React, {PropTypes} from 'react';

import Autosuggest from 'react-autosuggest';
import katexStyles from './katex.css.js';

let styles = {};

export const MentionComponent = React.createClass({
	propTypes: {
		value: PropTypes.string,
    block: PropTypes.bool,
    updateValue: PropTypes.func,
    changeToBlock: PropTypes.func,
    changeToInline: PropTypes.func,
	},
	getInitialState: function() {
    return {editing: false};
	},
	getDefaultProps: function() {
	},

  componentDidMount: function() {
  },

	openEdit: function() {
		this.setState({editing: true})
		setTimeout(() => this.refs.suggest.input.focus(), 0);
	},

	setSelected: function(selected) {
		// this.refs.input.focus();
		// this.setState({selected});
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

  changeToEditing: function() {
		const {text, type, meta} = this.props;
    this.setState({editing: true, text, type, meta});
    // setTimeout(() => this.refs.input.focus(), 0);
  },

  changeToNormal: function() {
    this.setState({editing: false});
  },

	getAutocompleteContent: function() {
		const results = ['a', 'b'];
	},

  renderDisplay() {
    const {displayHTML} = this.state;
    const {text, block} = this.props;
    return (
      <span className={'mention'} onDoubleClick={this.changeToEditing} style={styles.display}>
				@{text}
      </span>
    );
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
      <span style={{position: 'relative'}}>
        @
				<Autosuggest
					ref={'suggest'}
        	suggestions={files}
					onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
					onSuggestionsClearRequested={this.onSuggestionsClearRequested}
					getSuggestionValue={this.getSuggestionValue}
					renderSuggestion={this.renderSuggestion}
					inputProps={inputProps}
      	/>
			{/*
        <input
					className="pt-input"
          id="test"
          ref="input"
          style={styles.editing({clientWidth})}
          onDoubleClick={this.changeToNormal}
          onChange={this.handleChange}
          onKeyPress={this.handleKeyPress}
          type="text"
					name="name"
          value={text} />
					*/}
      </span>
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
