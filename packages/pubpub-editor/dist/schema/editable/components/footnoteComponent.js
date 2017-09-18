'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.FootnoteComponent = undefined;

var _core = require('@blueprintjs/core');

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var FootnoteComponent = exports.FootnoteComponent = _react2.default.createClass({
	displayName: 'FootnoteComponent',

	propTypes: {
		content: _react.PropTypes.string,
		updateContent: _react.PropTypes.func
	},
	getInitialState: function getInitialState() {
		return { selected: false, isOpen: false };
	},
	getDefaultProps: function getDefaultProps() {
		return {};
	},

	setSelected: function setSelected(selected) {
		this.setState({ selected: selected });
	},

	preventClick: function preventClick(evt) {
		this.props.forceSelection();
		evt.preventDefault();
	},

	updateLabel: function updateLabel(label) {
		this.setState({ label: label });
	},

	onConfirm: function onConfirm(value) {
		this.props.updateContent(value);
	},

	togglePopover: function togglePopover() {
		this.setState({ isOpen: !this.state.isOpen });
	},

	render: function render() {
		var content = this.props.content;
		var _state = this.state,
		    selected = _state.selected,
		    label = _state.label,
		    isOpen = _state.isOpen;


		var footnoteClass = (0, _classnames2.default)({
			'pub-footnote': true,
			'selected': selected || isOpen
		});

		var popoverContent = _react2.default.createElement(
			'div',
			{ className: 'pub-footnote-popover', style: { minWidth: 250 } },
			_react2.default.createElement(
				'div',
				null,
				_react2.default.createElement('span', {
					onClick: this.togglePopover,
					className: 'pt-icon-standard pt-icon-small-cross pt-tag-remove',
					style: { position: 'absolute', right: '5px', top: '5px' } }),
				_react2.default.createElement(
					'div',
					{ style: { marginBottom: 5, fontSize: '0.9em', marginLeft: -4 } },
					'Footnote:'
				),
				_react2.default.createElement(_core.EditableText, {
					defaultValue: content,
					multiline: true,
					minLines: 3, maxLines: 12,
					isEditing: true,
					onConfirm: this.onConfirm
				})
			)
		);

		return _react2.default.createElement(
			'span',
			{ className: footnoteClass, onClick: this.preventClick },
			_react2.default.createElement(
				_core.Popover,
				{ content: popoverContent,
					isModal: true,
					isOpen: isOpen,
					interactionKind: _core.PopoverInteractionKind.CLICK,
					popoverClassName: 'pt-popover-content-sizing pt-dark pt-minimal popover-down',
					position: _core.Position.BOTTOM,
					autoFocus: false,
					useSmartPositioning: false },
				_react2.default.createElement(
					'span',
					{ onClick: this.togglePopover },
					label
				)
			)
		);
	}
});

exports.default = FootnoteComponent;