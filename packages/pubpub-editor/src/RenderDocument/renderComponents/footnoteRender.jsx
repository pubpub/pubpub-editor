import { Popover, PopoverInteractionKind, Position } from '@blueprintjs/core';
import React, { PropTypes } from 'react';

import classNames from 'classnames';

export const FootnoteRender = React.createClass({
	propTypes: {
		content: PropTypes.string,
	},
	getInitialState: function() {
    return {selected: false};
	},
	getDefaultProps: function() {
		return {
		};
	},

	setSelected: function(selected) {
		this.setState({selected});
	},

  render() {

		const { content, label } = this.props;
		const { selected } = this.state;

		const footnoteClass = classNames({
			'pub-footnote': true,
      'selected': this.state.selected,
    });

		const popoverContent = (<div className="pub-footnote-popover" style={{minWidth: 250}}>
			<div>
				<div style={{marginBottom: 5, fontSize: '0.9em', marginLeft: -4}}>Footnote:</div>
				{content}
			 </div>
		</div>);

    return (
      <span className={footnoteClass}>
				<Popover content={popoverContent}
						 interactionKind={PopoverInteractionKind.CLICK}
						 popoverClassName="pt-popover-content-sizing pt-minimal"
						 position={Position.BOTTOM}
						 autoFocus={false}
						 useSmartPositioning={false}>
        	<div>{(label) ? label : "1"}</div>
				</Popover>
      </span>
    );
  },

});

export default FootnoteRender;
