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
		containerId: _react2.default.PropTypes.string.isRequired,
		view: _react2.default.PropTypes.object.isRequired,
		editorState: _react2.default.PropTypes.object.isRequired
	},
	getInitialState: function getInitialState() {
		return { input: null };
	},

	startInput: function startInput(type, run) {
		this.setState({ input: 'text', run: run });
	},

	componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
		if (this.props.editorState !== nextProps.editorState) {
			this.onChange();
		}
	},


	submitInput: function submitInput(evt) {
		if (evt.key === 'Enter') {
			var link = this.textInput.value;
			this.state.run({ href: link });
			this.setState({ input: null, run: null });
		}
	},

	onChange: function onChange() {
		var _props = this.props,
		    view = _props.view,
		    containerId = _props.containerId;


		var currentPos = view.state.selection.$to.pos;
		var currentNode = view.state.doc.nodeAt(currentPos - 1);
		var container = document.getElementById(containerId);

		if (!view.state.selection.$cursor && currentNode && currentNode.text) {
			var currentFromPos = view.state.selection.$from.pos;
			var currentToPos = view.state.selection.$to.pos;
			var left = view.coordsAtPos(currentFromPos).left - container.getBoundingClientRect().left;
			var right = view.coordsAtPos(currentToPos).right - container.getBoundingClientRect().left;
			var inlineCenter = left + (right - left) / 2;
			var inlineTop = view.coordsAtPos(currentFromPos).top - container.getBoundingClientRect().top;
			return this.setState({
				left: inlineCenter,
				top: inlineTop
			});
		}

		return this.setState({
			left: 0,
			top: 0
		});
	},

	renderTextInput: function renderTextInput() {
		var _this = this;

		var _state = this.state,
		    top = _state.top,
		    left = _state.left;

		return _react2.default.createElement(
			'div',
			{ onKeyPress: this.submitInput, className: 'pt-card pt-elevation-0 pt-dark', style: styles.container(top, left, 200) },
			_react2.default.createElement('input', { style: styles.textInput, ref: function ref(input) {
					_this.textInput = input;
				}, className: 'pt-input', type: 'text', placeholder: 'link', dir: 'auto' })
		);
	},


	render: function render() {
		var _this2 = this;

		var _state2 = this.state,
		    input = _state2.input,
		    left = _state2.left,
		    top = _state2.top;
		var view = this.props.view;


		var menuItems = (0, _formattingMenuConfig2.default)(view);

		if (input === 'text') {
			return this.renderTextInput();
		}

		return _react2.default.createElement(
			'div',
			{ className: 'pt-card pt-elevation-0 pt-dark popover-up', style: styles.container(top, left, 400) },
			menuItems.map(function (item, index) {
				// return <button key={`menuItem-${index}`} className={'pt-button pt-minimal'} style={item.isActive ? { ...styles.button, ...styles.active } : styles.button} onClick={item.run}>{item.text}</button>;
				// return <button key={`menuItem-${index}`} className={`pt-button pt-minimal ${item.icon}`} style={item.isActive ? { ...styles.button, ...styles.active } : styles.button} onClick={item.run} />;
				var onClick = void 0;
				if (item.input === 'text' && !item.isActive) {
					onClick = _this2.startInput.bind(_this2, item.input, item.run);
				} else {
					onClick = item.run;
				}
				return _react2.default.createElement('button', { key: 'menuItem-' + index, className: 'pt-button pt-minimal ' + item.icon, style: item.isActive ? _extends({}, styles.button, styles.active) : styles.button, onClick: onClick });
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
		if (!top) {
			return {
				display: 'none'
			};
		}
		return {
			transition: 'left 0.25s, top 0.1s',
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