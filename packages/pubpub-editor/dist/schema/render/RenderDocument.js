'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.RenderDocument = undefined;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _baseSchema = require('../baseSchema');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// import ReactDOM from 'react-dom';

var RenderDocument = exports.RenderDocument = _react2.default.createClass({
	displayName: 'RenderDocument',

	propTypes: {
		content: _react.PropTypes.object
	},
	getInitialState: function getInitialState() {
		return {};
	},
	componentWillMount: function componentWillMount() {},
	renderContent: function renderContent(_ref) {
		var _this = this;

		var item = _ref.item,
		    meta = _ref.meta;

		if (!item) {
			return null;
		}
		var content = item.map(function (node, index) {
			var nodeType = node.type;
			if (_baseSchema.nodes[nodeType] && _baseSchema.nodes[nodeType].toReact) {
				return _baseSchema.nodes[nodeType].toReact({ node: node, index: index, renderContent: _this.renderContent, meta: meta });
			}
		});

		return content;
	},


	render: function render() {
		var content = this.props.content;


		return _react2.default.createElement(
			'div',
			{ className: 'pub-body' },
			renderContent({ item: content, meta: {} })
		);
	}

});

exports.default = RenderDocument;