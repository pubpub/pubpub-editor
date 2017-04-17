'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.HTMLEditor = undefined;

var _core = require('@blueprintjs/core');

var _radium = require('radium');

var _radium2 = _interopRequireDefault(_radium);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var HTMLEditor = exports.HTMLEditor = _react2.default.createClass({
	displayName: 'HTMLEditor',

	propTypes: {
		value: _react.PropTypes.string,
		updateValue: _react.PropTypes.func,
		forceSelection: _react.PropTypes.func
	},
	getInitialState: function getInitialState() {
		return {
			editing: false
		};
	},

	getDefaultProps: function getDefaultProps() {
		return {};
	},

	forceSelection: function forceSelection(evt) {
		if (!this.state.selected) {
			this.props.forceSelection();
		}
		evt.preventDefault();
	},

	changeToEditing: function changeToEditing() {
		var _this = this;

		var clientWidth = _reactDom2.default.findDOMNode(this.refs.latexElem).getBoundingClientRect().width;
		this.setState({ editing: true, clientWidth: clientWidth });
		setTimeout(function () {
			return _this.refs.input.focus();
		}, 10);
	},

	changeToNormal: function changeToNormal() {
		var value = this.state.value || this.props.value;
		var displayHTML = this.generateHTML(value);
		this.props.updateValue(value);
		this.setState({ editing: false, displayHTML: displayHTML, value: null });
	},

	handleChange: function handleChange(event) {
		var value = event.target.value;
		this.setState({ value: value });
		this.forceUpdate();
		// this.props.updateValue(value);
	},

	handleKeyPress: function handleKeyPress(evt) {
		if (evt.key === 'Enter' && !this.props.block) {
			this.changeToNormal();
		}
	},

	setSelected: function setSelected(selected) {
		this.setState({ selected: selected });
	},

	renderDisplay: function renderDisplay() {
		var _state = this.state,
		    displayHTML = _state.displayHTML,
		    selected = _state.selected,
		    closePopOver = _state.closePopOver;
		var _props = this.props,
		    block = _props.block,
		    content = _props.content;


		return _react2.default.createElement(
			'span',
			{ onClick: this.forceSelection },
			_react2.default.createElement('span', {
				ref: 'htmlElem',
				className: 'pub-embed-html',
				dangerouslySetInnerHTML: { __html: content } })
		);
	},
	renderEdit: function renderEdit() {
		// const { clientWidth } = this.state;
		var block = this.props.block;


		var value = this.state.value || this.props.value;

		var popoverContent = _react2.default.createElement(
			'div',
			null,
			_react2.default.createElement(
				_core.Button,
				{ iconName: 'annotation', onClick: this.changeToNormal },
				'Save'
			)
		);

		return _react2.default.createElement(
			'span',
			{ style: { position: 'relative' }, onClick: this.forceSelection },
			block ? _react2.default.createElement(
				_core.Popover,
				{
					content: popoverContent,
					defaultIsOpen: true,
					interactionKind: _core.PopoverInteractionKind.CLICK,
					popoverClassName: '',
					position: _core.Position.BOTTOM,
					autoFocus: false,
					enforceFocus: false,
					useSmartPositioning: false },
				_react2.default.createElement(
					'div',
					{ className: 'pt-input-group' },
					_react2.default.createElement('span', { className: 'pt-icon pt-icon-function' }),
					_react2.default.createElement('textarea', {
						ref: 'input',
						type: 'text',
						className: 'pt-input',
						placeholder: 'Enter equation...',
						onChange: this.handleChange,
						value: value })
				)
			) : _react2.default.createElement(
				'span',
				null,
				_react2.default.createElement('span', { className: 'pt-icon pt-icon-function' }),
				_react2.default.createElement('input', {
					ref: 'input',
					type: 'text',
					className: 'pt-input',
					placeholder: 'Enter equation...',
					onChange: this.handleChange,
					onKeyPress: this.handleKeyPress,
					style: { width: 'auto' },
					value: value })
			)
		);
	},


	render: function render() {
		var editing = this.state.editing;


		if (editing) {
			return this.renderEdit();
		}
		return this.renderDisplay();
	}

});

exports.default = HTMLEditor;