import React, {PropTypes} from 'react';

import classNames from 'classnames';

export const ReferenceComponent = React.createClass({
	propTypes: {
		label: PropTypes.string,
	},
	getInitialState: function() {
    return { };
	},
	getDefaultProps: function() {
		return { };
	},

	setSelected: function(selected) {
		this.setState({selected});
	},


  render() {

		const label = (this.state.label || this.props.label);

		const referenceClass = classNames({
      'reference': true,
      'selected': this.state.selected,
    });

    return (
      <span className={referenceClass}>
        {(label) ? label : "[]"}
      </span>
    );
  }
});


export default ReferenceComponent;
