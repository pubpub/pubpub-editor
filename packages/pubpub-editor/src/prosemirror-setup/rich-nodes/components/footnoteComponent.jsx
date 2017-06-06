import { EditableText, Popover, PopoverInteractionKind, Position } from '@blueprintjs/core';
import React, { PropTypes } from 'react';

import classNames from 'classnames';

export const FootnoteComponent = React.createClass({
	propTypes: {
		content: PropTypes.string,
		updateContent: PropTypes.func,
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

	preventClick: function(evt) {
		this.props.forceSelection();
		evt.preventDefault();
	},

	updateLabel: function(label) {
		this.setState({ label });
	},

	onConfirm: function(value) {
		this.props.updateContent(value);
	},

  render() {

		const { content } = this.props;
		const { selected, label } = this.state;

		const footnoteClass = classNames({
			'pub-footnote': true,
      'selected': this.state.selected,
    });


		const popoverContent = (<div className="pub-footnote-popover" style={{minWidth: 250}}>
			<div>
				<span
					className="pt-icon-standard pt-icon-small-cross"
					style={{position: 'absolute', right: '0px', top: '0px'}}></span>

				<div style={{marginBottom: 5, fontSize: '0.9em', marginLeft: -4}}>Footnote:</div>
				<EditableText
					defaultValue={content}
					multiline
					minLines={3} maxLines={12}
					isEditing={true}
					onConfirm={this.onConfirm}
				 />
			 </div>
		</div>);

    return (
      <span className={footnoteClass} onClick={this.preventClick}>
				<Popover content={popoverContent}
						 interactionKind={PopoverInteractionKind.CLICK}
						 popoverClassName="pt-popover-content-sizing pt-minimal"
						 position={Position.BOTTOM}
						 autoFocus={false}
						 useSmartPositioning={false}>
        	<span>{label}</span>
				</Popover>
      </span>
    );
  },

});

export default FootnoteComponent;
