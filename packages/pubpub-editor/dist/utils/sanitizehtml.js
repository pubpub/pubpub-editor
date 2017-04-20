'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (html) {
  return (0, _xss2.default)(html, {
    whiteList: defaultList,
    css: false
  });
};

var _xss = require('xss');

var _xss2 = _interopRequireDefault(_xss);

var _default = require('xss/lib/default');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var defaultList = _default.whiteList;
defaultList['iframe'] = ['src', 'width', 'height'];