'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.EmbedRender = undefined;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _RenderFile = require('../RenderFile');

var _RenderFile2 = _interopRequireDefault(_RenderFile);

var _urlToType = require('../../../utils/urlToType');

var _urlToType2 = _interopRequireDefault(_urlToType);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var styles = {};

var EmbedRender = exports.EmbedRender = _react2.default.createClass({
	displayName: 'EmbedRender',

	propTypes: {
		url: _react.PropTypes.string,
		align: _react.PropTypes.oneOf(['inline', 'full', 'left', 'right', 'inline-word', 'max']),
		size: _react.PropTypes.string
	},
	getInitialState: function getInitialState() {
		return {
			selected: false
		};
	},
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
		var type = (0, _urlToType2.default)(url);

		var file = { name: '', url: url, type: type };

		var captionNode = children ? children[0] : null;
		var captionText = captionNode ? captionNode.text : '';

		return _react2.default.createElement(
			'div',
			{ ref: 'embedroot', className: 'pub-embed ' + this.props.className ? this.props.className : null },
			_react2.default.createElement(
				'figure',
				{ style: styles.figure({ size: size, align: align, false: false }) },
				_react2.default.createElement(
					'div',
					{ style: styles.row({ size: size, align: align }) },
					_react2.default.createElement(_RenderFile2.default, { file: file, style: styles.image })
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
	row: function row(_ref) {
		var size = _ref.size,
		    align = _ref.align;

		return {
			width: align !== 'max' ? size : '100%',
			position: 'relative',
			display: 'table-row'
		};
	},
	captionInput: {
		width: '100%',
		border: 'none',
		fontSize: '1em',
		minHeight: '1em'
	},
	image: {
		width: '100%'
	},
	figure: function figure(_ref2) {
		var size = _ref2.size,
		    align = _ref2.align,
		    selected = _ref2.selected;

		var style = {
			width: size,
			display: 'table',
			outline: selected ? '3px solid #BBBDC0' : '3px solid transparent',
			transition: 'outline-color 0.15s ease-in',
			paddingTop: '10px',
			marginRight: align === 'left' ? '20px' : null,
			marginLeft: align === 'right' ? '20px' : null
		};
		if (align === 'max') {
			style.width = 'calc(100% + 30px)';
			style.margin = '0 0 0 -15px';
		} else if (align === 'left') {
			style.float = 'left';
		} else if (align === 'right') {
			style.float = 'right';
		} else if (align === 'full') {
			style.margin = '0 auto';
		}
		return style;
	},
	caption: function caption(_ref3) {
		var size = _ref3.size,
		    align = _ref3.align;

		var style = {
			width: size,
			display: 'table-row'
		};
		return style;
	}
};

exports.default = EmbedRender;