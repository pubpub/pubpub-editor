'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FilePreview = undefined;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var styles = {};

var FileTranslation = {
  jpg: 'image',
  png: 'image',
  jpeg: 'image',
  tiff: 'image',
  gif: 'image',
  pdf: 'pdf',
  ipynb: 'jupyter',
  mp4: 'video',
  ogg: 'video',
  webm: 'video',
  csv: 'video'
};

var FilePreview = exports.FilePreview = _react2.default.createClass({
  displayName: 'FilePreview',

  propTypes: {
    fileURL: _react.PropTypes.string
  },
  render: function render() {
    var fileURL = this.props.fileURL;

    var extension = fileURL.split('.').pop();
    var fileType = FileTranslation[extension];
    switch (fileType) {
      case 'image':
        return _react2.default.createElement('img', { style: { width: '100%' }, src: fileURL });
      case 'video':
      case 'pdf':
      default:
        return _react2.default.createElement(
          'div',
          null,
          'Could not Render File'
        );
    }
  }
});

exports.default = FilePreview;