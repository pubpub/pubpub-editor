'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.CitationsRender = undefined;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var CitationsRender = exports.CitationsRender = _react2.default.createClass({
	displayName: 'CitationsRender',

	propTypes: {
		citations: _react.PropTypes.array
	},
	getInitialState: function getInitialState() {
		return {};
	},

	renderDisplay: function renderDisplay() {
		var renderedBib = this.props.renderedBib;

		var hideCitations = !(renderedBib && renderedBib.length > 0);

		return _react2.default.createElement(
			'div',
			null,
			!hideCitations ? _react2.default.createElement(
				'div',
				null,
				_react2.default.createElement(
					'h3',
					null,
					'Citations: '
				),
				renderedBib.map(function (bibItem, index) {
					return _react2.default.createElement('div', { key: index, dangerouslySetInnerHTML: { __html: bibItem.text } });
				})
			) : null
		);
	},


	render: function render() {
		var editing = this.state.editing;

		return this.renderDisplay();
	}
});

exports.default = CitationsRender;