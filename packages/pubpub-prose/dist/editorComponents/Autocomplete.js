'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.Autocomplete = undefined;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

require('../../style/autosuggest.scss');

var Autocomplete = exports.Autocomplete = _react2.default.createClass({
	displayName: 'Autocomplete',

	propTypes: {
		style: _react.PropTypes.object,
		URLs: _react.PropTypes.object,
		input: _react.PropTypes.string,
		onSelection: _react.PropTypes.func
	},

	getInitialState: function getInitialState() {
		return {
			suggestionCategory: null,
			renderedSuggestions: []
		};
	},
	render: function render() {
		return _react2.default.createElement(
			'div',
			{ className: 'pt-card pt-elevation-4', style: this.props.style },
			this.props.input
		);
	}
});

exports.default = Autocomplete;