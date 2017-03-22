'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.SuggestComponent = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactAutosuggest = require('react-autosuggest');

var _reactAutosuggest2 = _interopRequireDefault(_reactAutosuggest);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var SuggestComponent = exports.SuggestComponent = _react2.default.createClass({
	displayName: 'SuggestComponent',

	propTypes: {},
	getInitialState: function getInitialState() {
		return {};
	},


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
	render: function render() {
		var files = this.props.files;

		var text = this.state.text || this.props.text || '';

		var inputProps = {
			placeholder: 'Type a programming language',
			value: text,
			onChange: this.handleChange
		};

		console.log('these are the files!', files);

		return _react2.default.createElement(_reactAutosuggest2.default, {
			ref: 'suggest',
			suggestions: files,
			onSuggestionsFetchRequested: this.onSuggestionsFetchRequested,
			onSuggestionsClearRequested: this.onSuggestionsClearRequested,
			getSuggestionValue: this.getSuggestionValue,
			renderSuggestion: this.renderSuggestion,
			inputProps: inputProps
		});
	}
});

exports.default = SuggestComponent;