'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _core = require('@blueprintjs/core');

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var styles = {};

var BasePrompt = _react2.default.createClass({
  displayName: 'BasePrompt',

  propTypes: {
    onClose: _react.PropTypes.func,
    onSave: _react.PropTypes.func,
    title: _react.PropTypes.string,
    type: _react.PropTypes.oneOf(['link', 'table'])
  },
  getInitialState: function getInitialState() {
    return {};
  },

  saveLink: function saveLink() {
    var linkData = { href: this.refs.inputLink.value, title: ' ' };
    this.props.savePrompt(linkData);
  },
  saveTable: function saveTable() {
    var tableData = { rows: this.refs.inputRow.state.value, cols: this.refs.inputColumn.state.value };
    this.props.savePrompt(tableData);
  },


  renderLink: function renderLink() {
    return _react2.default.createElement(
      'div',
      null,
      _react2.default.createElement(
        'label',
        { className: 'pt-label' },
        'Link',
        _react2.default.createElement(
          'div',
          { className: 'pt-input-group' },
          _react2.default.createElement('span', { className: 'pt-icon pt-icon-link' }),
          _react2.default.createElement('input', { ref: 'inputLink', className: 'pt-input', type: 'text', placeholder: 'http://www.google.com', dir: 'auto' })
        )
      )
    );
  },

  savePrompt: function savePrompt() {
    var type = this.props.type;

    if (type === 'link') {
      this.saveLink();
    } else if (type === 'table') {
      this.saveTable();
    }
  },


  renderTable: function renderTable() {
    return _react2.default.createElement(
      'div',
      null,
      _react2.default.createElement(
        'label',
        { className: 'pt-label' },
        'Rows',
        _react2.default.createElement(
          'div',
          { className: 'pt-input-group' },
          _react2.default.createElement(_core.NumericInput, { ref: 'inputRow' })
        )
      ),
      _react2.default.createElement(
        'label',
        { className: 'pt-label' },
        'Columns',
        _react2.default.createElement(
          'div',
          { className: 'pt-input-group' },
          _react2.default.createElement(_core.NumericInput, { ref: 'inputColumn' })
        )
      )
    );
  },

  preventClick: function preventClick(evt) {
    evt.preventDefault();
  },

  render: function render() {
    var type = this.props.type;


    return _react2.default.createElement(
      'div',
      { onClick: this.preventClick },
      _react2.default.createElement(
        _core.Dialog,
        {
          iconName: 'inbox',
          isOpen: open,
          onClose: this.props.onClose,
          title: 'Insert file' },
        _react2.default.createElement(
          'div',
          { className: 'pt-dialog-body' },
          type === 'table' ? this.renderTable() : null,
          type === 'link' ? this.renderLink() : null
        ),
        _react2.default.createElement(
          'div',
          { className: 'pt-dialog-footer' },
          _react2.default.createElement(
            'div',
            { className: 'pt-dialog-footer-actions' },
            _react2.default.createElement(_core.Button, { intent: 'yes', onClick: this.savePrompt, text: 'Insert' })
          )
        )
      )
    );
  }
});

exports.default = BasePrompt;