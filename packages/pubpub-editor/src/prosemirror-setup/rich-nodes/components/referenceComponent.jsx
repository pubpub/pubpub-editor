import { Popover, PopoverInteractionKind, Position } from '@blueprintjs/core';
import React, { PropTypes } from 'react';

import classNames from 'classnames';

export const ReferenceComponent = React.createClass({
	propTypes: {
		label: PropTypes.string,
	},
	getInitialState: function() {
    return {};
	},
	getDefaultProps: function() {
		return {
		};
	},


  // what happens if you click or hover a reference?\
  //  could: emit an action that hovers the info
  //  could: pass in info stored in a citation database
  //  could: use node decorations to put info on them without storing it permanently
  //      -> Ideal


	setSelected: function(selected) {
		this.setState({selected});
	},

	preventClick: function(evt) {
		evt.preventDefault();
	},

	updateLabel: function(label) {
		this.setState({label});
	},

  render() {

		if (!this.state.label) {
			return null;
		}

		const referenceClass = classNames({
      'pub-reference': true,
      'selected': this.state.selected,
    });

		const popoverContent = (<div className="pub-reference-popover">
			<span dangerouslySetInnerHTML={{__html:this.props.getCitationString()}}></span>
		</div>);


    return (
      <span className={referenceClass} onClick={this.preventClick}>
				<Popover content={popoverContent}
						 interactionKind={PopoverInteractionKind.CLICK}
						 popoverClassName="pt-popover-content-sizing pt-minimal"
						 position={Position.BOTTOM}
						 autoFocus={false}
						 useSmartPositioning={false}>
        	{(this.state.label) ? this.state.label : "[]"}
				</Popover>
      </span>
    );
  },

});

export default ReferenceComponent;
