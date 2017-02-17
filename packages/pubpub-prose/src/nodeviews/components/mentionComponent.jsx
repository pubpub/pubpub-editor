import React, {PropTypes} from 'react';

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
    return {editing: true};
	},
	getDefaultProps: function() {
		return {
			context: 'document',
		};
	},

  componentDidMount: function() {
    setTimeout(() => this.refs.input.focus(), 0);
  },

  /*
	componentWillReceiveProps: function(nextProps) {
    if (this.props.value !== nextProps.value) {
      const text = nextProps.value;
      // Search for new plugins
    }
	},
  */


	setSelected: function(selected) {
		console.log('update selected!', selected);
		this.setState({selected});
	},

	componentWillUnmount: function() {
		console.log('unmounted atom!');
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


  renderDisplay() {
    const {displayHTML} = this.state;
    const {value, block} = this.props;
    return (
      <span className={'mention'} onDoubleClick={this.changeToEditing} style={styles.display}>
        @{value}
      </span>
    );
  },

  renderEdit() {
    const {clientWidth} = this.state;
    const {value, block} = this.props;
    return (
      <span style={{position: 'relative'}}>
        @
        <input
          id="test"
          ref="input"
          style={styles.editing({clientWidth})}
          onDoubleClick={this.changeToNormal}
          onChange={this.handleChange}
          onKeyPress={this.handleKeyPress}
          type="text" name="name"
          value={value} />
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
