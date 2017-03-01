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
		label: _react.PropTypes.string
	},
	getInitialState: function getInitialState() {
		return {};
	},
	getDefaultProps: function getDefaultProps() {
		return {};
	},

	// what happens if you click or hover a reference?\
	//  could: emit an action that hovers the info
	//  could: pass in info stored in a citation database
	//  could: use node decorations to put info on them without storing it permanently
	//      -> Ideal


	setSelected: function setSelected(selected) {
		this.setState({ selected: selected });
	},

	preventClick: function preventClick(evt) {
		evt.preventDefault();
	},

	updateLabel: function updateLabel(label) {
		this.setState({ label: label });
	},

	render: function render() {

		var referenceClass = (0, _classnames2.default)({
			'reference': true,
			'selected': this.state.selected
		});

		var popoverContent = _react2.default.createElement(
			'div',
			null,
			_react2.default.createElement('span', { dangerouslySetInnerHTML: { __html: this.props.getCitationString() } })
		);

		return _react2.default.createElement(
			'span',
			{ className: referenceClass, onClick: this.preventClick },
			_react2.default.createElement(
				_core.Popover,
				{ content: popoverContent,
					interactionKind: _core.PopoverInteractionKind.CLICK,
					popoverClassName: 'pt-popover-content-sizing',
					position: _core.Position.BOTTOM,
					autoFocus: false,
					useSmartPositioning: false },
				this.state.label ? this.state.label : "[]"
			)
		);
	}
});

exports.default = ReferenceComponent;