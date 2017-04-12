'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.EmbedRender = undefined;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _renderFiles = require('@pubpub/render-files');

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
		var type = (0, _renderFiles.URLToType)(url);

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
					_react2.default.createElement(_renderFiles.RenderFile, { file: file })
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
	captionInput: {
		width: '100%',
		border: 'none',
		fontSize: '1em',
		minHeight: '1em'
	},
	figure: function figure(_ref) {
		var size = _ref.size,
		    align = _ref.align,
		    selected = _ref.selected;

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
	caption: function caption(_ref2) {
		var size = _ref2.size,
		    align = _ref2.align;

		var style = {
			width: size,
			display: 'table-row'
		};
		return style;
	}
};

exports.default = EmbedRender;