'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.markdownitInstance = undefined;

var _markdownItHighlight = require('./markdown-it-highlight');

var _markdownItHighlight2 = _interopRequireDefault(_markdownItHighlight);

var _markdownIt = require('markdown-it');

var _markdownIt2 = _interopRequireDefault(_markdownIt);

var _markdownItKatex = require('markdown-it-katex');

var _markdownItKatex2 = _interopRequireDefault(_markdownItKatex);

var _markdownItReference = require('./markdown-it-reference');

var _markdownItReference2 = _interopRequireDefault(_markdownItReference);

var _markdownItSub = require('markdown-it-sub');

var _markdownItSub2 = _interopRequireDefault(_markdownItSub);

var _markdownItSup = require('markdown-it-sup');

var _markdownItSup2 = _interopRequireDefault(_markdownItSup);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var markdownitInstance = exports.markdownitInstance = (0, _markdownIt2.default)({
	html: false,
	linkify: true
}).use(_markdownItSub2.default) // Subscript
.use(_markdownItSup2.default) // Superscript
.use(_markdownItKatex2.default) // Latex math
.use(_markdownItReference2.default) // Reference parser
.use(_markdownItHighlight2.default); // Pub Highlight parser

exports.default = markdownitInstance;