'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.LatexEditor = undefined;

var _core = require('@blueprintjs/core');

var _radium = require('radium');

var _radium2 = _interopRequireDefault(_radium);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _katex = require('katex');

var _katex2 = _interopRequireDefault(_katex);

var _katexCss = require('./katex.css.js');

var _katexCss2 = _interopRequireDefault(_katexCss);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// import {safeGetInToJS} from 'utils/safeParse';

var ERROR_MSG_HTML = "<div class='pub-latex-error'>Error rendering equation</div>";

var LatexEditor = exports.LatexEditor = _react2.default.createClass({
	displayName: 'LatexEditor',

	propTypes: {
		value: _react.PropTypes.string,
		block: _react.PropTypes.bool,
		updateValue: _react.PropTypes.func,
		changeToBlock: _react.PropTypes.func,
		changeToInline: _react.PropTypes.func,
		forceSelection: _react.PropTypes.func
	},
	getInitialState: function getInitialState() {
		var displayHTML = this.generateHTML(this.props.value);
		return {
			editing: false,
			displayHTML: displayHTML,
			value: null
		};
	},

	getDefaultProps: function getDefaultProps() {
		return {};
	},

	componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
		if (this.props.block !== nextProps.block) {
			this.setState({ closePopOver: false });
		}
		if (this.props.value !== nextProps.value) {
			var text = nextProps.value;
			if (!this.state.editing) {
				var displayHTML = this.generateHTML(text);
				this.setState({ displayHTML: displayHTML });
			}
		}
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

	generateHTML: function generateHTML(text) {
		try {
			return _katex2.default.renderToString(text, { displayMode: this.props.block });
		} catch (err) {
			return ERROR_MSG_HTML;
		}
	},


	handleKeyPress: function handleKeyPress(evt) {
		if (evt.key === 'Enter' && !this.props.block) {
			this.changeToNormal();
		}
	},

	setSelected: function setSelected(selected) {
		this.setState({ selected: selected });
	},

	changeToInline: function changeToInline() {
		this.setState({ closePopOver: true });
		this.props.changeToInline();
	},

	changeToBlock: function changeToBlock() {
		this.setState({ closePopOver: true });
		this.props.changeToBlock();
	},

	renderDisplay: function renderDisplay() {
		var _state = this.state,
		    displayHTML = _state.displayHTML,
		    selected = _state.selected,
		    closePopOver = _state.closePopOver;
		var _props = this.props,
		    block = _props.block,
		    value = _props.value;


		var popoverContent = _react2.default.createElement(
			'div',
			{ className: 'pt-button-group pt-minimal' },
			_react2.default.createElement(
				_core.Button,
				{ iconName: 'annotation', onClick: this.changeToEditing },
				'Edit'
			),
			!block ? _react2.default.createElement(
				_core.Button,
				{ iconName: 'maximize', onClick: this.changeToBlock },
				'Block'
			) : _react2.default.createElement(
				_core.Button,
				{ iconName: 'minimize', onClick: this.changeToInline },
				'Inline'
			)
		);

		var isPopOverOpen = closePopOver ? false : undefined;

		return _react2.default.createElement(
			'span',
			{ onClick: this.forceSelection },
			_react2.default.createElement(_radium.Style, { rules: _katexCss2.default }),
			_react2.default.createElement(
				_core.Popover,
				{
					content: popoverContent,
					isOpen: isPopOverOpen,
					interactionKind: _core.PopoverInteractionKind.CLICK,
					popoverClassName: '',
					position: _core.Position.BOTTOM,
					useSmartPositioning: false },
				block ? _react2.default.createElement('div', {
					ref: 'latexElem',
					className: 'pub-latex pub-latex-block',
					dangerouslySetInnerHTML: { __html: displayHTML } }) : _react2.default.createElement('span', {
					ref: 'latexElem',
					className: 'pub-latex',
					dangerouslySetInnerHTML: { __html: displayHTML } })
			)
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

exports.default = LatexEditor;