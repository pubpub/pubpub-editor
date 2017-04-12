'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.ReferenceComponent = undefined;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ReferenceComponent = exports.ReferenceComponent = _react2.default.createClass({
	displayName: 'ReferenceComponent',

	propTypes: {
		label: _react.PropTypes.string
	},
	getInitialState: function getInitialState() {
		return {};
	},
	getDefaultProps: function getDefaultProps() {
		return {};
	},

	setSelected: function setSelected(selected) {
		this.setState({ selected: selected });
	},

	render: function render() {

		var label = this.state.label || this.props.label;

		var referenceClass = (0, _classnames2.default)({
			'reference': true,
			'selected': this.state.selected
		});

		return _react2.default.createElement(
			'span',
			{ className: referenceClass },
			label ? label : "[]"
		);
	}
});

exports.default = ReferenceComponent;