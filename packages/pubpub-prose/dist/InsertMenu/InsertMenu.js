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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var styles = void 0;

var InsertMenu = exports.InsertMenu = _react2.default.createClass({
	displayName: 'InsertMenu',

	propTypes: {
		editor: _react.PropTypes.object,
		top: _react.PropTypes.number
	},

	render: function render() {
		var menuItems = (0, _insertMenuConfig2.default)(this.props.editor);

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
							return _react2.default.createElement(_core.MenuItem, { text: item.text, onClick: item.run });
						})
					),
					interactionKind: _core.PopoverInteractionKind.CLICK,
					popoverClassName: 'pt-minimal pt-popover-dismiss',
					position: _core.Position.BOTTOM_LEFT,
					inline: true,
					useSmartPositioning: false },
				_react2.default.createElement('button', { className: 'pt-button pt-minimal pt-icon-insert' })
			)
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