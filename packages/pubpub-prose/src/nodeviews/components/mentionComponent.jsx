import React, {PropTypes} from 'react';

import Autosuggest from 'react-autosuggest';

let styles = {};

export const MentionComponent = React.createClass({
	propTypes: {
		text: PropTypes.string,
		type: PropTypes.string,
		meta: PropTypes.object,
    revertToText: PropTypes.func,
    updateMention: PropTypes.func,
    suggestComponent: PropTypes.any,
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
		setTimeout(() => this.focus(), 0);
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
    setTimeout(() => this.focus(), 0);
  },

  changeToNormal: function() {
    this.setState({editing: false});
  },

	focus: function() {
		if (this.refs.suggest && this.refs.suggest.focus) {
			this.refs.suggest.focus();
		}
	},

	updateMention: function(text) {
		this.props.updateMention(text);
		this.changeToNormal();
	},

  renderDisplay() {
    const { text } = this.props;
    return (
      <span className={'mention'} onDoubleClick={this.changeToEditing} style={styles.display}>
				@{text}
      </span>
    );
  },

  renderEdit() {
    const SuggestComponent = (this.props.suggestComponent) ? this.props.suggestComponent.component : null;

    return (
      <span style={{position: 'relative'}}>
        @
				{(SuggestComponent) ? <SuggestComponent ref="suggest" revertToText={this.props.revertToText} updateMention={this.updateMention} {...this.props.suggestComponent.props}/> : null}
      </span>
    );
  },


  render: function() {
    const { editing } = this.state;
    if (editing) {
      return this.renderEdit();
    }
		return this.renderDisplay();
	}
});


export default MentionComponent;
