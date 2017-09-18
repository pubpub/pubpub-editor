'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.RenderFile = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var styles = void 0;

var RenderFile = exports.RenderFile = _react2.default.createClass({
	displayName: 'RenderFile',

	propTypes: {
		file: _react.PropTypes.object,
		style: _react.PropTypes.object,
		draggable: _react.PropTypes.any
	},

	render: function render() {
		var _props = this.props,
		    draggable = _props.draggable,
		    style = _props.style;

		var file = this.props.file || {};

		switch (file.type) {
			case 'image/png':
			case 'image/jpg': // Is this ever actually used?
			case 'image/jpeg':
			case 'image/gif':
				return _react2.default.createElement('img', { draggable: draggable, alt: file.name, src: file.url, style: _extends({ maxWidth: '100%' }, style) });
			case 'video/mp4':
			case 'mp4':
				return _react2.default.createElement(
					'video',
					{ width: '100%', controls: true },
					_react2.default.createElement('source', { src: file.url, type: 'video/mp4' })
				);
			default:
				return _react2.default.createElement(
					'div',
					{ className: 'pt-callout' },
					_react2.default.createElement(
						'p',
						null,
						'Can not render ',
						file.name,
						'. Click to download the file in your browser.'
					),
					_react2.default.createElement(
						'a',
						{ href: file.url },
						_react2.default.createElement(
							'button',
							{ className: 'pt-button' },
							'Click to Download'
						)
					)
				);
		}
	}
});

exports.default = RenderFile;


styles = {
	container: {
		position: 'relative'
	},
	pubBody: {
		padding: '0em 1.25em',
		fontFamily: 'serif',
		lineHeight: '1.6em',
		fontSize: '1.2em',
		color: '#333',
		maxWidth: '700px'
	}
};