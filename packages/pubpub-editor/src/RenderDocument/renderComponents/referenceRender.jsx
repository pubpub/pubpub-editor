import { Popover, PopoverInteractionKind, Position } from '@blueprintjs/core';
import React, { PropTypes }  from 'react';

import classNames from 'classnames';

export const ReferenceComponent = React.createClass({
	propTypes: {
		citationID: PropTypes.string,
		label: PropTypes.string,
		engine: PropTypes.object,
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

	getCitationString: function() {
		const { engine, citationID } = this.props;
		return engine.getSingleBibliography(citationID);
	},

  render() {

		const label = (this.state.label || this.props.label);

		const referenceClass = classNames({
      'reference': true,
      'selected': this.state.selected,
    });

		const popoverContent = (<div className="pub-reference-popover">
			<span dangerouslySetInnerHTML={{ __html:this.getCitationString() }}></span>
		</div>);

    return (
      <span className={referenceClass}>
				<Popover content={popoverContent}
						 interactionKind={PopoverInteractionKind.CLICK}
						 popoverClassName="pt-popover-content-sizing pt-minimal"
						 position={Position.BOTTOM}
						 autoFocus={false}
						 useSmartPositioning={false}>
        	  {(label) ? label : "[]"}
				</Popover>
      </span>
    );
  }
});


export default ReferenceComponent;
