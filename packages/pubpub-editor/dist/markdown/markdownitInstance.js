'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.markdownitInstance = undefined;

var _markdownItAttrs = require('markdown-it-attrs');

var _markdownItAttrs2 = _interopRequireDefault(_markdownItAttrs);

var _markdownItCitations = require('./markdown-it-citations');

var _markdownItCitations2 = _interopRequireDefault(_markdownItCitations);

var _markdownItEmbed = require('./markdown-it-embed');

var _markdownItEmbed2 = _interopRequireDefault(_markdownItEmbed);

var _markdownItFootnotes = require('./markdown-it-footnotes');

var _markdownItFootnotes2 = _interopRequireDefault(_markdownItFootnotes);

var _markdownItHighlight = require('./markdown-it-highlight');

var _markdownItHighlight2 = _interopRequireDefault(_markdownItHighlight);

var _markdownIt = require('markdown-it');

var _markdownIt2 = _interopRequireDefault(_markdownIt);

var _markdownItKatex = require('markdown-it-katex');

var _markdownItKatex2 = _interopRequireDefault(_markdownItKatex);

var _markdownItModifyLinks = require('./markdown-it-modify-links');

var _markdownItModifyLinks2 = _interopRequireDefault(_markdownItModifyLinks);

var _markdownItReference = require('./markdown-it-reference');

var _markdownItReference2 = _interopRequireDefault(_markdownItReference);

var _markdownItSub = require('markdown-it-sub');

var _markdownItSub2 = _interopRequireDefault(_markdownItSub);

var _markdownItSup = require('markdown-it-sup');

var _markdownItSup2 = _interopRequireDefault(_markdownItSup);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var markdownitInstance = exports.markdownitInstance = (0, _markdownIt2.default)({
	html: true,
	linkify: true
}).use(_markdownItCitations2.default) // Pub Citation Parser
.use(_markdownItSub2.default) // Subscript
.use(_markdownItSup2.default) // Superscript
.use(_markdownItKatex2.default) // Latex math
.use(_markdownItReference2.default) // Reference parser
.use(_markdownItAttrs2.default) // Reference parser
.use(_markdownItHighlight2.default) // Pub Highlight parser
.use(_markdownItModifyLinks2.default).use(_markdownItEmbed2.default).use(_markdownItFootnotes2.default);

console.log(markdownitInstance);
console.log(_markdownItFootnotes2.default);

exports.default = markdownitInstance;