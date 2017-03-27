'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.Autocomplete = undefined;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _requestPromise = require('request-promise');

var _requestPromise2 = _interopRequireDefault(_requestPromise);

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
			_suggestionCategory: null,
			_currentSuggestions: [],
			_selectedIndex: 0,
			_loading: false
		};
	},
	componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
		if (this.props.input !== nextProps.input) {
			this.getNewSelections(nextProps.input);
		}
	},
	getNewSelections: function getNewSelections(input) {
		console.log(input);
		if (this.state[input]) {
			return this.setState({ _currentSuggestions: this.state[input] });
		}
		(0, _requestPromise2.default)({ uri: 'https://www.pubpub.org/api/search/users?q=' + input }).then(function (response) {
			console.log(response);
		}).catch(function (err) {
			console.log(err);
		});
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