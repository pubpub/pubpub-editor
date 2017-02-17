import React, {PropTypes} from 'react';

import classNames from 'classnames';

let styles = {};

export const ReferenceComponent = React.createClass({
	propTypes: {
		value: PropTypes.string,
    block: PropTypes.bool,
    updateValue: PropTypes.func,
    changeToBlock: PropTypes.func,
    changeToInline: PropTypes.func,
	},
	getInitialState: function() {
    return {editing: true};
	},
	getDefaultProps: function() {
		return {
			context: 'document',
		};
	},


  // what happens if you click or hover a reference?\
  //  could: emit an action that hovers the info
  //  could: pass in info stored in a citation database
  //  could: use node decorations to put info on them without storing it permanently
  //      -> Ideal


  /*
	componentWillReceiveProps: function(nextProps) {
    if (this.props.value !== nextProps.value) {
      const text = nextProps.value;
      // Search for new plugins
    }
	},
  */

	setSelected: function(selected) {
		this.setState({selected});
	},


  handleKeyPress: function(e) {
     if (e.key === 'Enter' && !this.props.block) {
       this.changeToNormal();
     }
  },

  handleChange: function(event) {
    const value = event.target.value;
    this.props.updateValue(value);
  },

  changeToEditing: function() {
    this.setState({editing: true});
    setTimeout(() => this.refs.input.focus(), 0);
  },

  changeToNormal: function() {
    this.setState({editing: false});
  },

	updateLabel: function(label) {
		this.setState({label});
	},


  renderDisplay() {

		const label = (this.state.label || this.props.label);

		const referenceClass = classNames({
      'reference': true,
      'selected': this.state.selected,
    });

    return (
      <span className={referenceClass}>
        {(label) ? label : "[1]"}
      </span>
    );
  },


  render: function() {
		return this.renderDisplay();
	}
});

styles = {
  wrapper: {
    backgroundColor: 'blue',
  },
  selected: {

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

export default ReferenceComponent;
