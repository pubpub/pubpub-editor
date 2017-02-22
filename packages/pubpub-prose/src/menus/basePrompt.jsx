import { Button, Dialog, Dropdown, Intent, NumericInput } from '@blueprintjs/core';
import React, {PropTypes} from 'react';

let styles = {};

const BasePrompt = React.createClass({
	propTypes: {
    onClose: PropTypes.func,
    onSave: PropTypes.func,
    title: PropTypes.string,
    type: PropTypes.oneOf(['link', 'table']),
	},
	getInitialState: function() {
		return {};
	},

	saveLink() {
    const linkData = {href: this.refs.inputLink.value, title: ' '};
    this.props.savePrompt(linkData);
	},

  saveTable() {
    const tableData = {rows: this.refs.inputRow.state.value, cols: this.refs.inputColumn.state.value};
    this.props.savePrompt(tableData);
	},

  renderLink: function() {
    return (
      <div>
        <label className="pt-label">
          Link
          <div className="pt-input-group">
            <span className="pt-icon pt-icon-link"></span>
            <input ref="inputLink" className="pt-input"  type="text" placeholder="http://www.google.com" dir="auto" />
          </div>
        </label>
      </div>
    );
  },

  savePrompt() {
    const {type} = this.props;
    if (type === 'link') {
      this.saveLink();
    } else if (type === 'table') {
      this.saveTable();
    }
  },

  renderTable: function() {
    return (
      <div>
        <label className="pt-label">
          Rows
          <div className="pt-input-group">
            <NumericInput  ref="inputRow"/>
          </div>
        </label>

        <label className="pt-label">
          Columns
          <div className="pt-input-group">
            <NumericInput ref="inputColumn"/>
          </div>
        </label>
      </div>
    )
  },

  preventClick: function(evt) {
    evt.preventDefault();
  },

  render() {
    const {type} = this.props;

    return (
      <div onClick={this.preventClick}>
      <Dialog
          iconName="inbox"
          isOpen={open}
          onClose={this.props.onClose}
          title="Insert file">
          <div className="pt-dialog-body">
            {(type === 'table') ? this.renderTable() : null }
            {(type === 'link') ? this.renderLink() : null }
          </div>
          <div className="pt-dialog-footer">
              <div className="pt-dialog-footer-actions">
                  <Button intent={'yes'} onClick={this.savePrompt} text="Insert" />
              </div>
          </div>
      </Dialog>
    </div>
    );
  },

});

export default BasePrompt;
