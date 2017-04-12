'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.RenderDocument = undefined;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _markdown = require('../markdown');

var _renderReactFromJSON = require('./renderReactFromJSON');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// import ReactDOM from 'react-dom';

var RenderDocument = exports.RenderDocument = _react2.default.createClass({
	displayName: 'RenderDocument',

	propTypes: {
		json: _react.PropTypes.object,
		markdown: _react.PropTypes.object,
		localFiles: _react.PropTypes.array,
		localReferences: _react.PropTypes.array
	},
	getInitialState: function getInitialState() {
		return {};
	},
	componentWillMount: function componentWillMount() {},


	generateFileMap: function generateFileMap() {
		var files = this.props.localFiles || [];
		var fileMap = {};
		var _iteratorNormalCompletion = true;
		var _didIteratorError = false;
		var _iteratorError = undefined;

		try {
			for (var _iterator = files[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
				var file = _step.value;

				fileMap[file.name] = file.url;
			}
		} catch (err) {
			_didIteratorError = true;
			_iteratorError = err;
		} finally {
			try {
				if (!_iteratorNormalCompletion && _iterator.return) {
					_iterator.return();
				}
			} finally {
				if (_didIteratorError) {
					throw _iteratorError;
				}
			}
		}

		return fileMap;
	},

	render: function render() {
		var _props = this.props,
		    json = _props.json,
		    markdown = _props.markdown,
		    localReferences = _props.localReferences,
		    localFiles = _props.localFiles;


		var renderedJSON = void 0;
		if (markdown) {
			renderedJSON = (0, _markdown.markdownToJSON)(markdown, localReferences);
		} else {
			renderedJSON = json;
		}

		return _react2.default.createElement(
			'div',
			{ className: 'pub-body' },
			(0, _renderReactFromJSON.renderReactFromJSON)(renderedJSON, this.generateFileMap())
		);
	}

});

exports.default = RenderDocument;