'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.InsertMenu = undefined;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _core = require('@blueprintjs/core');

var _insertMenuConfig = require('./insertMenuConfig');

var _insertMenuConfig2 = _interopRequireDefault(_insertMenuConfig);

var _InsertMenuDialogFiles = require('./InsertMenuDialogFiles');

var _InsertMenuDialogFiles2 = _interopRequireDefault(_InsertMenuDialogFiles);

var _InsertMenuDialogReferences = require('./InsertMenuDialogReferences');

var _InsertMenuDialogReferences2 = _interopRequireDefault(_InsertMenuDialogReferences);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var styles = void 0;

var InsertMenu = exports.InsertMenu = _react2.default.createClass({
	displayName: 'InsertMenu',

	propTypes: {
		editor: _react.PropTypes.object,
		top: _react.PropTypes.number
	},

	getInitialState: function getInitialState() {
		return {
			openDialog: undefined
		};
	},


	openDialog: function openDialog(dialogType, callback) {
		console.log('hi', dialogType, callback);
		this.setState({ openDialog: dialogType });
	},

	closeDialog: function closeDialog() {
		this.setState({ openDialog: undefined });
	},

	onFileSelect: function onFileSelect(evt) {
		console.log(evt.target.files[0]);
		evt.target.value = null;
	},

	onReferenceAdd: function onReferenceAdd(item) {
		console.log(item);
	},

	render: function render() {
		var menuItems = (0, _insertMenuConfig2.default)(this.props.editor, this.openDialog);

		return _react2.default.createElement(
			'div',
			{ style: styles.container(this.props.top) },
			_react2.default.createElement(
				_core.Popover,
				{
					content: _react2.default.createElement(
						_core.Menu,
						null,
						menuItems.map(function (item) {
							return _react2.default.createElement(_core.MenuItem, { onClick: item.run, text: item.text });
						})
					),
					interactionKind: _core.PopoverInteractionKind.CLICK,
					popoverClassName: 'pt-minimal pt-popover-dismiss',
					position: _core.Position.BOTTOM_LEFT,
					inline: true,
					useSmartPositioning: false },
				_react2.default.createElement('button', { className: 'pt-button pt-minimal pt-icon-insert' })
			),
			_react2.default.createElement(_InsertMenuDialogFiles2.default, {
				isOpen: this.state.openDialog === 'files',
				onClose: this.closeDialog,
				onFileSelect: this.onFileSelect }),
			_react2.default.createElement(_InsertMenuDialogReferences2.default, {
				isOpen: this.state.openDialog === 'references',
				onClose: this.closeDialog,
				onReferenceAdd: this.onReferenceAdd })
		);
	}

});

exports.default = InsertMenu;


styles = {
	container: function container(top) {
		return {
			position: 'absolute',
			left: '-35px',
			top: top - 8
		};
	}
};