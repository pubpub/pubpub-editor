'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.TableMenu = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _tableMenuConfig = require('./tableMenuConfig');

var _core = require('@blueprintjs/core');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var styles = void 0;

var TableMenu = exports.TableMenu = _react2.default.createClass({
	displayName: 'TableMenu',

	propTypes: {
		editor: _react.PropTypes.object,
		top: _react.PropTypes.number,
		left: _react.PropTypes.number
	},

	getInitialState: function getInitialState() {
		return { top: null, left: null };
	},

	updatePosition: function updatePosition(view) {

		var sel = view.state.selection;
		if ((0, _tableMenuConfig.inTable)(sel.$from) == -1 || !sel.empty) {
			if (this.state.top) {
				this.setState({ top: null });
			}
			return;
		}

		var container = document.getElementById('rich-editor-container');
		var currentFromPos = sel.$from.pos;
		var left = view.coordsAtPos(currentFromPos).left - container.getBoundingClientRect().left;
		var inlineCenter = left;
		var inlineTop = view.coordsAtPos(currentFromPos).top - container.getBoundingClientRect().top;

		this.setState({
			left: inlineCenter,
			top: inlineTop
		});
	},


	render: function render() {
		var _this = this;

		var _state = this.state,
		    top = _state.top,
		    left = _state.left;
		var editor = this.props.editor;


		if (!top || !editor || !editor.view) {
			return null;
		}

		var view = editor.view;

		return _react2.default.createElement(
			'div',
			{ className: 'pt-card pt-elevation-0 pt-dark', style: styles.container(top, left) },
			_tableMenuConfig.menuItems.map(function (item, index) {
				var isActive = item.isActive(view.state);
				var run = item.run.bind(_this, view.state, view.dispatch);
				return _react2.default.createElement(
					'button',
					{ key: 'menuItem-' + index, className: 'pt-button pt-minimal', style: isActive ? _extends({}, styles.button, styles.active) : styles.button, onClick: run },
					_react2.default.createElement(
						_core.Tooltip,
						{
							className: 'pt-dark pt-tooltip-indicator pt-minimal',
							content: _react2.default.createElement(
								'span',
								null,
								item.text
							) },
						item.icon ? _react2.default.createElement('span', { className: 'pt-icon-standard ' + item.icon }) : item.text
					)
				);
			})
		);
	}

});

exports.default = TableMenu;


styles = {
	container: function container(top, left) {
		var width = 175;
		return {
			zIndex: 10,
			width: width + 'px',
			position: 'absolute',
			height: '30px',
			lineHeight: '30px',
			padding: '0px',
			textAlign: 'center',
			top: top - 40,
			left: Math.max(left - width / 2, -50),
			overflow: 'hidden'
		};
	},
	button: {
		minWidth: '5px',
		padding: '0px 7px',
		fontSize: '1.1em',
		outline: 'none',
		borderRadius: '0px',
		color: 'rgba(255, 255, 255, 0.7)'
	},
	active: {
		color: 'rgba(255, 255, 255, 1)'
	}
};