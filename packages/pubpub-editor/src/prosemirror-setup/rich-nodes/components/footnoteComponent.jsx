import { EditableText, Popover, PopoverInteractionKind, Position } from '@blueprintjs/core';
import React, { PropTypes } from 'react';

import classNames from 'classnames';

export const FootnoteComponent = React.createClass({
	propTypes: {
		content: PropTypes.string,
		updateContent: PropTypes.func,
	},
	getInitialState: function() {
    return {selected: false, isOpen: false};
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

	togglePopover: function() {
		this.setState({isOpen: !this.state.isOpen});
	},

  render() {

		const { content } = this.props;
		const { selected, label, isOpen } = this.state;

		const footnoteClass = classNames({
			'pub-footnote': true,
      'selected': selected || isOpen,
    });


		const popoverContent = (<div className="pub-footnote-popover" style={{minWidth: 250}}>
			<div>
				<span
					onClick={this.togglePopover}
					className="pt-icon-standard pt-icon-small-cross pt-tag-remove"
					style={{position: 'absolute', right: '5px', top: '5px'}}></span>

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
						 isModal={true}
						 isOpen={isOpen}
						 interactionKind={PopoverInteractionKind.CLICK}
						 popoverClassName="pt-popover-content-sizing pt-dark pt-minimal popover-down"
						 position={Position.BOTTOM}
						 autoFocus={false}
						 useSmartPositioning={false}>
        	<span onClick={this.togglePopover}>{label}</span>
				</Popover>
      </span>
    );
  },

});

export default FootnoteComponent;
