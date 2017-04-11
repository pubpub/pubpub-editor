'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.FormattingMenu = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _formattingMenuConfig = require('./formattingMenuConfig');

var _formattingMenuConfig2 = _interopRequireDefault(_formattingMenuConfig);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var styles = void 0;

var FormattingMenu = exports.FormattingMenu = _react2.default.createClass({
	displayName: 'FormattingMenu',

	propTypes: {
		editor: _react.PropTypes.object,
		top: _react.PropTypes.number,
		left: _react.PropTypes.number
	},
	getInitialState: function getInitialState() {
		return { input: null };
	},

	startInput: function startInput(type, run) {
		this.setState({ input: 'text', run: run });
	},

	submitInput: function submitInput(evt) {
		if (evt.key === 'Enter') {
			var link = this.textInput.value;
			this.state.run({ href: link });
			this.setState({ input: null, run: null });
		}
	},

	renderTextInput: function renderTextInput() {
		var _this = this;

		return _react2.default.createElement(
			'div',
			{ onKeyPress: this.submitInput, className: 'pt-card pt-elevation-0 pt-dark', style: styles.container(this.props.top, this.props.left, 200) },
			_react2.default.createElement('input', { style: styles.textInput, ref: function ref(input) {
					_this.textInput = input;
				}, className: 'pt-input', type: 'text', placeholder: 'link', dir: 'auto' })
		);
	},


	render: function render() {
		var _this2 = this;

		var menuItems = (0, _formattingMenuConfig2.default)(this.props.editor);
		var input = this.state.input;


		if (input === 'text') {
			return this.renderTextInput();
		}

		return _react2.default.createElement(
			'div',
			{ className: 'pt-card pt-elevation-0 pt-dark', style: styles.container(this.props.top, this.props.left, 400) },
			menuItems.map(function (item, index) {
				var onClick = void 0;
				if (item.input === 'text' && !item.isActive) {
					onClick = _this2.startInput.bind(_this2, item.input, item.run);
				} else {
					onClick = item.run;
				}
				return _react2.default.createElement(
					'button',
					{ key: 'menuItem-' + index, className: 'pt-button pt-minimal', style: item.isActive ? _extends({}, styles.button, styles.active) : styles.button, onClick: onClick },
					item.icon ? _react2.default.createElement('span', { className: 'pt-icon-standard ' + item.icon }) : item.text
				);
			})
		);
	}

});

exports.default = FormattingMenu;


styles = {
	textInput: {
		height: '80%',
		verticalAlign: 'baseline'
	},
	container: function container(top, left, width) {
		return {
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