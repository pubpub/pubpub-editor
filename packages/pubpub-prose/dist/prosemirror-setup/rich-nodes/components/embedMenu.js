'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.EmbedEditor = undefined;

var _core = require('@blueprintjs/core');

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var EmbedEditor = exports.EmbedEditor = _react2.default.createClass({
	displayName: 'EmbedEditor',

	propTypes: {
		embedAttrs: _react.PropTypes.object,
		updateParams: _react.PropTypes.func
	},

	getInitialState: function getInitialState() {
		return { caption: null };
	},

	setEmbedAttribute: function setEmbedAttribute(key, value, evt) {
		var obj = {};
		obj[key] = value;
		this.props.updateParams(obj);
	},

	toggleCaption: function toggleCaption(evt) {
		var checked = !!this.props.embedAttrs.caption;
		if (checked) {
			this.props.removeCaption();
		} else {
			this.props.createCaption();
		}
	},

	render: function render() {

		return _react2.default.createElement(
			'div',
			null,
			_react2.default.createElement(
				'div',
				{ className: 'pt-button-group minimal' },
				_react2.default.createElement(_core.Button, { iconName: 'align-left', onClick: this.setEmbedAttribute.bind(this, 'align', 'left') }),
				_react2.default.createElement(_core.Button, { iconName: 'align-center', onClick: this.setEmbedAttribute.bind(this, 'align', 'full') }),
				_react2.default.createElement(_core.Button, { iconName: 'align-right', onClick: this.setEmbedAttribute.bind(this, 'align', 'right') })
			),
			_react2.default.createElement('br', null),
			_react2.default.createElement(
				'div',
				{ className: "pt-text-muted", style: { marginTop: 10, fontSize: '0.75em' } },
				'Options'
			),
			_react2.default.createElement('hr', { style: { marginTop: 0, marginBottom: 8 } }),
			_react2.default.createElement(_core.Switch, { checked: !!this.props.embedAttrs.caption, label: 'Caption', onChange: this.toggleCaption })
		);
	}
});

exports.default = EmbedEditor;