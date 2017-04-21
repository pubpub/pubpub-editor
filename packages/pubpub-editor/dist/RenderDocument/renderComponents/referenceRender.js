'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.ReferenceComponent = undefined;

var _core = require('@blueprintjs/core');

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ReferenceComponent = exports.ReferenceComponent = _react2.default.createClass({
	displayName: 'ReferenceComponent',

	propTypes: {
		citationID: _react.PropTypes.string,
		label: _react.PropTypes.string,
		engine: _react.PropTypes.object
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

	getCitationString: function getCitationString() {
		var _props = this.props,
		    engine = _props.engine,
		    citationID = _props.citationID;

		return engine.getSingleBibliography(citationID);
	},

	render: function render() {

		var label = this.state.label || this.props.label;

		var referenceClass = (0, _classnames2.default)({
			'reference': true,
			'selected': this.state.selected
		});

		var popoverContent = _react2.default.createElement(
			'div',
			{ className: 'pub-reference-popover' },
			_react2.default.createElement('span', { dangerouslySetInnerHTML: { __html: this.getCitationString() } })
		);

		return _react2.default.createElement(
			'span',
			{ className: referenceClass },
			_react2.default.createElement(
				_core.Popover,
				{ content: popoverContent,
					interactionKind: _core.PopoverInteractionKind.CLICK,
					popoverClassName: 'pt-popover-content-sizing pt-minimal',
					position: _core.Position.BOTTOM,
					autoFocus: false,
					useSmartPositioning: false },
				label ? label : "[]"
			)
		);
	}
});

exports.default = ReferenceComponent;