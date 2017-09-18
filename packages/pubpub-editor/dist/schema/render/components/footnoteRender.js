'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.FootnoteRender = undefined;

var _core = require('@blueprintjs/core');

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var FootnoteRender = exports.FootnoteRender = _react2.default.createClass({
	displayName: 'FootnoteRender',

	propTypes: {
		content: _react.PropTypes.string
	},
	getInitialState: function getInitialState() {
		return { selected: false };
	},
	getDefaultProps: function getDefaultProps() {
		return {};
	},

	setSelected: function setSelected(selected) {
		this.setState({ selected: selected });
	},

	render: function render() {
		var _props = this.props,
		    content = _props.content,
		    label = _props.label;
		var selected = this.state.selected;


		var footnoteClass = (0, _classnames2.default)({
			'pub-footnote': true,
			'selected': this.state.selected
		});

		var popoverContent = _react2.default.createElement(
			'div',
			{ className: 'pub-footnote-popover', style: { minWidth: 250 } },
			_react2.default.createElement(
				'div',
				null,
				_react2.default.createElement(
					'div',
					{ style: { marginBottom: 5, fontSize: '0.9em', marginLeft: -4 } },
					'Footnote:'
				),
				content
			)
		);

		return _react2.default.createElement(
			'span',
			{ className: footnoteClass },
			_react2.default.createElement(
				_core.Popover,
				{ content: popoverContent,
					interactionKind: _core.PopoverInteractionKind.CLICK,
					popoverClassName: 'pt-popover-content-sizing pt-minimal',
					position: _core.Position.BOTTOM,
					autoFocus: false,
					useSmartPositioning: false },
				_react2.default.createElement(
					'div',
					null,
					label
				)
			)
		);
	}
});

exports.default = FootnoteRender;