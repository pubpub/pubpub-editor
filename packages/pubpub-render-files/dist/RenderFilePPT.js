'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.RenderFilePPT = undefined;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _radium = require('radium');

var _radium2 = _interopRequireDefault(_radium);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var RenderFilePPT = exports.RenderFilePPT = _react2.default.createClass({
	displayName: 'RenderFilePPT',

	propTypes: {
		file: _react.PropTypes.object
	},
	getInitialState: function getInitialState() {
		return {
			width: 600,
			height: 500
		};
	},
	componentDidMount: function componentDidMount() {
		this.sizeFrame();
		window.addEventListener('resize', this.sizeFrame);
	},
	componentWillUnmount: function componentWillUnmount() {
		window.removeEventListener('resize', this.sizeFrame);
	},


	sizeFrame: function sizeFrame() {
		var container = document.getElementsByClassName('ppt-container')[0];
		this.setState({
			width: container.offsetWidth,
			height: container.offsetWidth * (5 / 6)
		});
	},

	render: function render() {
		// TODO: This currently just uses google docs embed viewer for ppt files.
		// This obviously is not a good long-term or open source solution.
		// We need a better tool when possible.
		var file = this.props.file || {};
		return _react2.default.createElement(
			'div',
			{ className: 'ppt-container' },
			_react2.default.createElement('iframe', {
				src: 'http://docs.google.com/gview?url=' + file.url + '&embedded=true',
				style: { width: this.state.width, height: this.state.height },
				frameBorder: '0' })
		);
	}
});

exports.default = (0, _radium2.default)(RenderFilePPT);