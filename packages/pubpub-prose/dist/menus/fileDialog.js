'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.FileDialog = undefined;

var _core = require('@blueprintjs/core');

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _filePreview = require('./filePreview');

var _filePreview2 = _interopRequireDefault(_filePreview);

var _fileUpload = require('./fileUpload');

var _fileUpload2 = _interopRequireDefault(_fileUpload);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var styles = {};

var FileDialog = exports.FileDialog = _react2.default.createClass({
	displayName: 'FileDialog',

	propTypes: {
		fileAccept: _react.PropTypes.string,
		saveFile: _react.PropTypes.func,
		onClose: _react.PropTypes.func,
		open: _react.PropTypes.bool
	},
	getInitialState: function getInitialState() {
		return { editing: true };
	},

	setSelected: function setSelected(selected) {
		console.log('update selected!', selected);
		this.setState({ selected: selected });
	},

	uploadFile: function uploadFile(_ref) {
		var url = _ref.url,
		    filename = _ref.filename,
		    preview = _ref.preview;

		this.setState({ url: url, filename: filename, preview: preview });
	},

	saveFile: function saveFile() {
		var _state = this.state,
		    url = _state.url,
		    filename = _state.filename;

		this.props.saveFile({ url: url, filename: filename });
	},

	renderDisplay: function renderDisplay() {
		var _props = this.props,
		    open = _props.open,
		    fileAccept = _props.fileAccept,
		    files = _props.files;
		var url = this.state.url;


		console.log('got props files', files);
		return _react2.default.createElement(
			'div',
			null,
			_react2.default.createElement(
				_core.Dialog,
				{
					iconName: 'inbox',
					isOpen: open,
					onClose: this.props.onClose,
					title: 'Insert file'
				},
				_react2.default.createElement(
					'div',
					{ className: 'pt-dialog-body' },
					!this.state.url || !this.state.preview ? _react2.default.createElement(_fileUpload2.default, { files: files, fileAccept: fileAccept, uploadFile: this.uploadFile }) : _react2.default.createElement(
						'div',
						{ style: { display: 'block', margin: '0 auto', textAlign: 'center', maxWidth: '300px' } },
						_react2.default.createElement(_filePreview2.default, { fileURL: this.state.url })
					)
				),
				_react2.default.createElement(
					'div',
					{ className: 'pt-dialog-footer' },
					_react2.default.createElement(
						'div',
						{ className: 'pt-dialog-footer-actions' },
						_react2.default.createElement(_core.Button, { intent: 'yes', disabled: !this.state.url, onClick: this.saveFile, text: 'Upload' })
					)
				)
			)
		);
	},


	render: function render() {
		var editing = this.state.editing;

		return this.renderDisplay();
	}
});

exports.default = FileDialog;