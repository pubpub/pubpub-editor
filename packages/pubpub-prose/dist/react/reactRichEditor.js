'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.RichEditorWrapper = undefined;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _index = require('../index');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*
<Editor
    mentionsComponent={component}
    files={array}, // Array of file objects.
    handleFileUpload={function}
    fileUploadComplete={object} // Data about completed file upload
    onChange={function} // To update editorState which is managed above Editor
    initialState={object}
    />
*/

var RichEditorWrapper = exports.RichEditorWrapper = _react2.default.createClass({
	displayName: 'RichEditorWrapper',

	propTypes: {},

	getInitialState: function getInitialState() {
		return {
			docJSON: null,
			fileMap: null
		};
	},
	componentWillMount: function componentWillMount() {},
	componentDidMount: function componentDidMount() {
		this.createEditor(null);
	},
	componentWillUpdate: function componentWillUpdate(nextProps) {
		if (this.props) {}
	},
	onChange: function onChange(editorState) {},
	createEditor: function createEditor(docJSON) {
		var _props = this.props,
		    handleFileUpload = _props.handleFileUpload,
		    onError = _props.onError;


		if (this.editor1) {
			this.editor1.remove();
		}
		var place = _reactDom2.default.findDOMNode(this.refs.container);
		this.editor1 = new _index.RichEditor({
			place: place,
			contents: docJSON,
			handlers: {
				createFile: handleFileUpload,
				captureError: onError,
				onChange: this.onChange
			}
		});
	},


	render: function render() {
		return _react2.default.createElement(
			'div',
			null,
			_react2.default.createElement('div', { ref: 'container', className: 'pubEditor', id: 'pubEditor' })
		);
	}

});

exports.default = RichEditorWrapper;