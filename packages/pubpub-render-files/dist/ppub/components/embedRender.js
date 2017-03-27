'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.EmbedRender = undefined;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _RenderFile = require('../../RenderFile');

var _urlToType = require('../../urlToType');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var styles = {};

var EmbedRender = exports.EmbedRender = _react2.default.createClass({
	displayName: 'EmbedRender',

	propTypes: {
		url: _react.PropTypes.string,
		align: _react.PropTypes.oneOf(['inline', 'full', 'left', 'right', 'inline-word']),
		size: _react.PropTypes.string
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

	componentWillUpdate: function componentWillUpdate(nextProps, nextState) {},

	render: function render() {
		var _props = this.props,
		    size = _props.size,
		    align = _props.align,
		    url = _props.url,
		    children = _props.children;
		var _false = false,
		    selected = _false.selected;


		var data = this.props.data || {};
		// Data is the version object with a populated parent field.
		// The parent field is the atomData field
		var type = (0, _urlToType.urlToType)(url);

		var file = { name: '', url: url, type: type };

		var captionNode = children ? children[0] : null;
		var captionText = captionNode ? captionNode.text : '';

		return _react2.default.createElement(
			'div',
			{ ref: 'embedroot', className: 'pub-embed ' + this.props.className },
			_react2.default.createElement(
				'figure',
				{ style: styles.figure({ size: size, align: align, false: false }) },
				_react2.default.createElement(
					'div',
					{ style: { width: size, position: 'relative', display: 'table-row' } },
					_react2.default.createElement(_RenderFile.RenderFile, { file: file })
				),
				_react2.default.createElement(
					'figcaption',
					{ style: styles.caption({ size: size, align: align }) },
					_react2.default.createElement(
						'div',
						{ style: styles.captionInput, ref: 'captioninsert' },
						children
					)
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
	captionInput: {
		width: '100%',
		border: 'none',
		fontSize: '1em',
		minHeight: '1em'
	},
	embed: function embed(_ref2) {
		var size = _ref2.size;


		var style = {
			zIndex: 10000,
			pointerEvents: 'all',
			position: 'absolute',
			minWidth: '200px',
			width: 'calc(' + size + ' * 0.8)',
			margin: '0 calc(' + size + ' * 0.1)'
		};

		var parsedSize = parseInt(size);
		var realSize = 650 * (parsedSize / 100);
		if (realSize * 0.8 < 200) {
			var newMargin = Math.round((realSize - 200) / 2);
			style.margin = '0 ' + newMargin + 'px';
		}
		return style;
	},
	button: {
		padding: '0em 0em',
		height: '0.75em',
		width: '0.75em',
		position: 'relative',
		top: '-0.15em',
		verticalAlign: 'middle',
		display: 'inline-block',
		cursor: 'pointer'
	},
	hover: {
		minWidth: '275px',
		padding: '1em',
		fontSize: '0.85em'
	},
	number: {
		display: 'inline-block',
		height: '100%',
		verticalAlign: 'top',
		position: 'relative',
		top: '-0.45em',
		fontSize: '0.85em'
	},
	outline: function outline(_ref3) {
		var selected = _ref3.selected;

		return {
			outline: selected ? '3px solid #BBBDC0' : '3px solid transparent',
			transition: 'outline-color 0.15s ease-in',
			paddingTop: '10px'

		};
	},
	figure: function figure(_ref4) {
		var size = _ref4.size,
		    align = _ref4.align,
		    selected = _ref4.selected;

		var style = {
			width: size,
			display: 'table',
			outline: selected ? '3px solid #BBBDC0' : '3px solid transparent',
			transition: 'outline-color 0.15s ease-in',
			paddingTop: '10px'
		};
		if (align === 'left') {
			style.float = 'left';
		} else if (align === 'right') {
			style.float = 'right';
		} else if (align === 'full') {
			style.margin = '0 auto';
		}
		return style;
	},
	caption: function caption(_ref5) {
		var size = _ref5.size,
		    align = _ref5.align;

		var style = {
			width: size,
			display: 'table-row'
		};
		return style;
	},
	captionText: function captionText(_ref6) {
		var align = _ref6.align;

		var style = {
			width: '100%',
			display: 'inline-block'
		};
		return style;
	}
};

exports.default = EmbedRender;