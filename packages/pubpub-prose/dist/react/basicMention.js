'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.MentionComponent = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactAutosuggest = require('react-autosuggest');

var _reactAutosuggest2 = _interopRequireDefault(_reactAutosuggest);

var _katexCss = require('./katex.css.js');

var _katexCss2 = _interopRequireDefault(_katexCss);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var styles = {};

var MentionComponent = exports.MentionComponent = _react2.default.createClass({
	displayName: 'MentionComponent',

	propTypes: {},
	getDefaultProps: function getDefaultProps() {},

	componentDidMount: function componentDidMount() {},

	focus: function focus() {
		this.refs.suggest.input.focus();
	},

	setSelected: function setSelected(selected) {},

	componentWillUnmount: function componentWillUnmount() {},

	handleKeyPress: function handleKeyPress(e) {
		if (e.key === 'Enter' && !this.props.block) {
			var _state = this.state,
			    text = _state.text,
			    type = _state.type,
			    meta = _state.meta;
			// this.refs.input.blur();

			this.props.updateMention({ text: text, type: type, meta: meta });
			this.changeToNormal();
		}
	},

	handleChange: function handleChange(event, _ref) {
		var newValue = _ref.newValue;

		var value = newValue;
		if (value.length === 0) {
			this.props.revertToText();
			return;
		}
		this.setState({ text: newValue, type: 'file', meta: {} });
		// this.props.updateMention({text: value, type: 'file', meta: {}});
	},

	changeToNormal: function changeToNormal() {
		this.setState({ editing: false });
	},

	getAutocompleteContent: function getAutocompleteContent() {
		var results = ['a', 'b'];
	},

	onSuggestionsFetchRequested: function onSuggestionsFetchRequested(_ref2) {
		var value = _ref2.value;

		return;
	},


	// Autosuggest will call this function every time you need to clear suggestions.
	onSuggestionsClearRequested: function onSuggestionsClearRequested() {
		this.setState({
			suggestions: []
		});
	},
	getSuggestionValue: function getSuggestionValue(suggestion) {
		return suggestion;
	},
	renderSuggestion: function renderSuggestion(suggestion) {
		return _react2.default.createElement(
			'div',
			null,
			suggestion
		);
	},
	renderInputComponent: function renderInputComponent(inputProps) {
		var _this = this;

		return _react2.default.createElement(
			'span',
			null,
			_react2.default.createElement('input', _extends({ ref: function ref(input) {
					_this.textInput = input;
				} }, inputProps))
		);
	},
	renderEdit: function renderEdit() {
		var clientWidth = this.state.clientWidth;
		var block = this.props.block;

		var text = this.state.text || this.props.text;

		var files = ['A', 'B', 'C'];

		var inputProps = {
			placeholder: 'Type a programming language',
			value: text,
			onChange: this.handleChange
		};

		return _react2.default.createElement(_reactAutosuggest2.default, {
			ref: 'suggest',
			suggestions: files,
			onSuggestionsFetchRequested: this.onSuggestionsFetchRequested,
			onSuggestionsClearRequested: this.onSuggestionsClearRequested,
			getSuggestionValue: this.getSuggestionValue,
			renderSuggestion: this.renderSuggestion,
			inputProps: inputProps
		});
	},


	render: function render() {
		var editing = this.state.editing;

		if (editing) {
			return this.renderEdit();
		}
		return this.renderDisplay();
	}
});

styles = {
	wrapper: {
		backgroundColor: 'blue'
	},
	display: {},
	editing: function editing(_ref3) {
		var clientWidth = _ref3.clientWidth;

		return {
			display: 'inline',
			minWidth: '100px',
			fontSize: '12px',
			margin: '0px',
			padding: '0px',
			lineHeight: '1em',
			border: '2px solid #BBBDC0',
			borderRadius: '2px'
		};
	}
};

exports.default = MentionComponent;