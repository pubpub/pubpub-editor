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

require('../../style/autosuggest.scss');

var SuggestComponent = exports.SuggestComponent = _react2.default.createClass({
	displayName: 'SuggestComponent',

	propTypes: {},
	getInitialState: function getInitialState() {
		return { suggestionCategory: null, renderedSuggestions: [] };
	},


	focus: function focus() {
		this.refs.suggest.input.focus();
	},

	handleKeyPress: function handleKeyPress(e) {
		if (e.key === 'Enter') {
			var text = this.state.text;

			this.props.onSelected(text);
		}
	},

	handleChange: function handleChange(event, _ref) {
		var newValue = _ref.newValue;

		var value = newValue;
		if (value.length === 0) {
			this.props.onCancel();
			return;
		}
		this.setState({ text: newValue });
	},

	// Either searches through the list of suggestionsCategories or calls
	// getSuggestionsByCategory to fetch the data within a category
	// All results are filtered to match the value`
	getSuggestions: function getSuggestions(_ref2) {
		var _this = this;

		var value = _ref2.value,
		    suggestionCategory = _ref2.suggestionCategory;


		return new Promise(function (resolve, reject) {
			var _props = _this.props,
			    getSuggestionsByCategory = _props.getSuggestionsByCategory,
			    suggestionCategories = _props.suggestionCategories;


			var inputValue = value.trim().toLowerCase();
			var inputLength = inputValue.length;

			var suggestionsSource = void 0;
			var shouldFilter = true;

			// a hack for the edgecase where you've selected a value but the state of suggestionCategory hasn't updated yet
			// in this case, check if the value is the same as a category, and if so, use that as the category
			if (suggestionCategory === null && suggestionCategories.indexOf(value) !== -1) {
				shouldFilter = false;
				suggestionsSource = getSuggestionsByCategory({ value: value, suggestionCategory: value });
			} else if (suggestionCategory === null) {
				suggestionsSource = Promise.resolve(suggestionCategories);
			} else {
				suggestionsSource = getSuggestionsByCategory({ value: value, suggestionCategory: suggestionCategory });
			}

			suggestionsSource.then(function (suggestionResults) {
				if (shouldFilter) {
					var filteredSuggestions = inputLength === 0 ? suggestionResults : suggestionResults.filter(function (lang) {
						return lang.toLowerCase().slice(0, inputLength) === inputValue;
					});
					resolve(filteredSuggestions);
				} else {
					resolve(suggestionResults);
				}
			});
		});
	},
	onSuggestionsFetchRequested: function onSuggestionsFetchRequested(_ref3) {
		var _this2 = this;

		var value = _ref3.value;
		var suggestionCategory = this.state.suggestionCategory;


		this.getSuggestions({ value: value, suggestionCategory: suggestionCategory }).then(function (filteredSuggestions) {
			_this2.setState({ renderedSuggestions: filteredSuggestions });
		});
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
		var _this3 = this;

		return _react2.default.createElement(
			'span',
			null,
			_react2.default.createElement('input', _extends({ ref: function ref(input) {
					_this3.textInput = input;
				} }, inputProps))
		);
	},
	onSuggestionSelected: function onSuggestionSelected(event, _ref4) {
		var suggestion = _ref4.suggestion,
		    suggestionValue = _ref4.suggestionValue,
		    suggestionIndex = _ref4.suggestionIndex,
		    sectionIndex = _ref4.sectionIndex,
		    method = _ref4.method;

		if (this.state.suggestionCategory === null) {
			this.setState({ suggestionCategory: suggestion, text: '' });
		} else {
			this.props.onSelected(suggestion);
			this.setState({ suggestionCategory: null, text: '', renderedSuggestions: [] });
		}
	},
	render: function render() {
		var _state = this.state,
		    suggestionCategory = _state.suggestionCategory,
		    renderedSuggestions = _state.renderedSuggestions;

		var text = this.state.text || this.props.text || '';

		var shouldRenderSuggestions = suggestionCategory !== null;

		var inputProps = {
			placeholder: '',
			value: text,
			onChange: this.handleChange
		};

		return _react2.default.createElement(
			'span',
			null,
			_react2.default.createElement(_reactAutosuggest2.default, {
				ref: 'suggest',
				suggestions: renderedSuggestions,
				onSuggestionsFetchRequested: this.onSuggestionsFetchRequested,
				onSuggestionsClearRequested: this.onSuggestionsClearRequested,
				getSuggestionValue: this.getSuggestionValue,
				renderSuggestion: this.renderSuggestion,
				onSuggestionSelected: this.onSuggestionSelected,
				alwaysRenderSuggestions: true,
				inputProps: inputProps
			})
		);
	}
});

exports.default = SuggestComponent;