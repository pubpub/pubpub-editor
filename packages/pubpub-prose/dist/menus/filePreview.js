'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FilePreview = undefined;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _renderFiles = require('@pubpub/render-files');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var FilePreview = exports.FilePreview = _react2.default.createClass({
  displayName: 'FilePreview',

  propTypes: {
    url: _react.PropTypes.string,
    type: _react.PropTypes.string
  },
  render: function render() {
    var _props = this.props,
        url = _props.url,
        type = _props.type;

    var extension = fileURL.split('.').pop();
    var fileType = FileTranslation[extension];
    var file = { url: url, type: type };

    return _react2.default.createElement(_renderFiles.RenderFile, { file: file });
  }
});

exports.default = FilePreview;