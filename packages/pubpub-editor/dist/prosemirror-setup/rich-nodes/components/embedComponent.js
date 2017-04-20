'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.EmbedComponent = undefined;

var _core = require('@blueprintjs/core');

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _renderFiles = require('@pubpub/render-files');

var _embedMenu = require('./embedMenu');

var _embedMenu2 = _interopRequireDefault(_embedMenu);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _reactResizableBox = require('react-resizable-box');

var _reactResizableBox2 = _interopRequireDefault(_reactResizableBox);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var styles = {};

var EmbedComponent = exports.EmbedComponent = _react2.default.createClass({
	displayName: 'EmbedComponent',

	propTypes: {
		url: _react.PropTypes.string,
		align: _react.PropTypes.oneOf(['inline', 'full', 'left', 'right', 'inline-word']),
		size: _react.PropTypes.string,
		updateAttrs: _react.PropTypes.func
	},
	getInitialState: function getInitialState() {
		this.DOC_WIDTH = 650;
		return {
			selected: false
		};
	},
	getDefaultProps: function getDefaultProps() {
		return {};
	},

	getSize: function getSize() {
		var elem = _reactDom2.default.findDOMNode(this.refs.menupointer);
		return {
			width: elem.clientWidth,
			left: elem.offsetLeft,
			top: elem.offsetTop
		};
	},

	setCiteCount: function setCiteCount(citeCount) {
		this.setState({ citeCount: citeCount });
		this.forceUpdate();
	},

	setSelected: function setSelected(selected) {
		this.setState({ selected: selected });
	},

	focusAndSelect: function focusAndSelect() {
		this.setState({ selected: true });
		this.refs.embedroot.focus();
	},

	updateAttrs: function updateAttrs(newAttrs) {
		this.props.updateAttrs(newAttrs);
	},

	getInsert: function getInsert() {
		return this.refs.captioninsert;
	},

	updateCaption: function updateCaption(val) {
		if (!val) {
			this.props.removeCaption();
			return;
		}
		this.props.updateCaption(val);
	},

	forceSelection: function forceSelection(evt) {
		if (!this.state.selected) {
			this.props.forceSelection();
		}
		evt.preventDefault();
	},

	render: function render() {
		var _this = this;

		var _props = this.props,
		    size = _props.size,
		    align = _props.align,
		    url = _props.url,
		    filename = _props.filename;
		var selected = this.state.selected;

		var caption = this.state.caption || this.props.caption;
		var data = this.props.data || {};
		var file = { url: url, name: filename, type: (0, _renderFiles.URLToType)(url) };

		var popoverContent = _react2.default.createElement(_embedMenu2.default, { createCaption: this.props.createCaption, removeCaption: this.props.removeCaption, embedAttrs: this.props, updateParams: this.updateAttrs });

		return _react2.default.createElement(
			'div',
			{ draggable: 'false', ref: 'embedroot', className: 'pub-embed ' + this.props.className, onClick: this.forceSelection },
			_react2.default.createElement(
				'figure',
				{ style: styles.figure({ size: size, align: align, false: false }) },
				_react2.default.createElement(
					'div',
					{ style: { width: size, position: 'relative', display: 'table-row' } },
					_react2.default.createElement(
						_core.Popover,
						{ content: popoverContent,
							interactionKind: _core.PopoverInteractionKind.CLICK,
							popoverClassName: 'pt-popover-content-sizing',
							position: _core.Position.BOTTOM,
							autoFocus: false,
							popoverWillOpen: function popoverWillOpen(evt) {
								// returns focus to the image so that deleting the embed will work
								_this.refs.embedroot.focus();
							},
							useSmartPositioning: false },
						!!url ? _react2.default.createElement(
							_reactResizableBox2.default,
							{
								width: '100%',
								height: 'auto',
								maxWidth: this.DOC_WIDTH,
								customStyle: styles.outline({ false: false }),
								onResizeStop: function onResizeStop(direction, styleSize, clientSize, delta) {
									var ratio = (clientSize.width / _this.DOC_WIDTH * 100).toFixed(1);
									_this.updateAttrs({ size: ratio + '%' });
								} },
							_react2.default.createElement(_renderFiles.RenderFile, { draggable: 'false', style: styles.image({ selected: selected }), file: file })
						) : _react2.default.createElement(
							'div',
							{ className: 'pt-callout pt-intent-danger' },
							_react2.default.createElement(
								'h5',
								null,
								'Could not find file: ',
								filename
							),
							'The file you\'re including is not uploaded to your pub, so it cannot be displayed.'
						)
					)
				),
				_react2.default.createElement(
					'figcaption',
					{ style: styles.caption({ size: size, align: align }) },
					this.props.caption ? _react2.default.createElement(_core.EditableText, {
						className: 'pub-caption',
						ref: 'captionArea',
						maxLines: 5,
						minLines: 1,
						multiline: true,
						confirmOnEnterKey: true,
						placeholder: 'Edit caption',
						defaultValue: caption,
						onConfirm: this.updateCaption
					}) : null
				)
			)
		);
	}
});

styles = {
	image: function image(_ref) {
		var selected = _ref.selected;

		return {
			width: '100%',
			outline: selected ? '3px solid #BBBDC0' : '3px solid transparent',
			transition: 'outline-color 0.15s ease-in'
		};
	},
	outline: function outline(_ref2) {
		var selected = _ref2.selected;

		return {
			outline: selected ? '3px solid #BBBDC0' : '3px solid transparent',
			transition: 'outline-color 0.15s ease-in',
			paddingTop: '10px'

		};
	},
	figure: function figure(_ref3) {
		var size = _ref3.size,
		    align = _ref3.align,
		    selected = _ref3.selected;

		var style = {
			width: !!size ? size : 'auto',
			display: 'table',
			outline: selected ? '3px solid #BBBDC0' : '3px solid transparent',
			transition: 'outline-color 0.15s ease-in',
			paddingTop: '10px'
		};
		if (align === 'left') {
			style.float = 'left';
		} else if (align === 'right') {
			style.float = 'right';
		} else if (align === 'full' || !align) {
			style.margin = '0 auto';
		}
		return style;
	},
	caption: function caption(_ref4) {
		var size = _ref4.size,
		    align = _ref4.align;

		var style = {
			lineHeight: '30px',
			fontSize: '1em',
			width: size,
			display: 'table-row'
		};
		return style;
	}
};

exports.default = EmbedComponent;