'use strict';

var _toMarkdown = require('to-markdown');

var _toMarkdown2 = _interopRequireDefault(_toMarkdown);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var converters = [{
  filter: ['html', 'body', 'span', 'div'],
  replacement: function replacement(innerHTML) {
    return innerHTML;
  }
}, {
  filter: ['head', 'script', 'style'],
  replacement: function replacement() {
    return '';
  }
}, {
  filter: function filter(node) {
    return node.nodeName === 'A' && !node.getAttribute('href');
  },
  replacement: function replacement(content, node) {
    return content;
  }
}];

exports.markdowntoHTML = function (htmlStr) {
  return (0, _toMarkdown2.default)(htmlStr, { gfm: true, converters: converters });
};