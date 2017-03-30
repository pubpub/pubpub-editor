'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.InsertMenuDialogFiles = undefined;

var _core = require('@blueprintjs/core');

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var InsertMenuDialogFiles = exports.InsertMenuDialogFiles = _react2.default.createClass({
	displayName: 'InsertMenuDialogFiles',

	propTypes: {
		onClose: _react.PropTypes.func,
		isOpen: _react.PropTypes.bool,
		onFileSelect: _react.PropTypes.func
	},

	render: function render() {
		return _react2.default.createElement(
			_core.Dialog,
			{ isOpen: this.props.isOpen, onClose: this.props.onClose, title: 'Upload Files' },
			_react2.default.createElement(
				'div',
				{ className: 'pt-dialog-body' },
				_react2.default.createElement(
					'b',
					null,
					'Type \'@\' in the editor to insert files you\'ve already uploaded.'
				),
				_react2.default.createElement(
					'label',
					{ htmlFor: 'upload-media-input', className: 'pt-button' },
					'Choose File to Upload',
					_react2.default.createElement('input', { id: 'upload-media-input', type: 'file', onChange: this.props.onFileSelect, style: { position: 'fixed', top: '-1000px' } })
				)
			)
		);
	}
});

exports.default = InsertMenuDialogFiles;