'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.markdownParser = undefined;

var _prosemirrorMarkdown = require('prosemirror-markdown');

var _prosemirrorModel = require('prosemirror-model');

var _markdownItEmbed = require('./markdown-it-embed');

var _markdownItEmbed2 = _interopRequireDefault(_markdownItEmbed);

var _markdownIt = require('markdown-it');

var _markdownIt2 = _interopRequireDefault(_markdownIt);

var _schema = require('../prosemirror-setup/schema');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*
import pagebreak from './markdown-it-pagebreak';
import sub from 'markdown-it-sub';
import sup from 'markdown-it-sup';
import emoji from 'markdown-it-emoji';
*/

var newSpec = _schema.schema.spec;
newSpec.topNode = "article";

var markdownSchema = new _prosemirrorModel.Schema(newSpec);

var markdownParser = exports.markdownParser = new _prosemirrorMarkdown.MarkdownParser(markdownSchema, (0, _markdownIt2.default)({ html: false }),
/*
.use(emoji)
.use(sub)
.use(sup)
.use(pagebreak)
.use(embed),
*/
{
	blockquote: { block: 'blockquote' },
	paragraph: { block: 'paragraph' },
	list_item: { block: 'list_item' },
	bullet_list: { block: 'bullet_list' },
	ordered_list: { block: 'ordered_list', attrs: function attrs(tok) {
			return { order: +tok.attrGet('order') || 1 };
		} },
	heading: { block: 'heading', attrs: function attrs(tok) {
			return { level: +tok.tag.slice(1) };
		} },
	code_block: { block: 'code_block' },
	fence: { block: 'code_block' },
	hr: { node: 'horizontal_rule' },
	pagebreak: { node: 'page_break' },
	/*
 image: {node: 'image', attrs: tok => ({
 	src: tok.attrGet('src'),
 	title: tok.attrGet('title') || null,
 	alt: tok.children[0] && tok.children[0].content || null
 })},
 */
	embed: { node: 'embed', attrs: function attrs(tok) {
			return {
				source: tok.attrGet('source'),
				className: tok.attrGet('className') || null,
				id: tok.attrGet('id') || null,
				align: tok.attrGet('align') || null,
				size: tok.attrGet('size') || null,
				caption: tok.attrGet('caption') || null,
				mode: tok.attrGet('mode') || 'embed',
				data: JSON.parse(decodeURIComponent(tok.attrGet('data'))) || null
			};
		} },
	emoji: { node: 'emoji', attrs: function attrs(tok) {
			return {
				content: tok.content,
				markup: tok.markup
			};
		} },
	hardbreak: { node: 'hard_break' },
	text: { block: 'text', attrs: function attrs(tok) {
			console.log(tok);
			console.log(tok.content);
			return {};
		} },

	table: { block: 'table', attrs: function attrs(tok) {
			console.log(tok);return {};
		} },
	tbody: { block: 'table', attrs: function attrs(tok) {
			console.log(tok);return {};
		} },
	thead: { block: 'none', attrs: function attrs(tok) {
			console.log(tok);return {};
		} },

	tr: { block: 'table_row', attrs: function attrs(tok) {
			console.log(tok);return {};
		} },
	td: { block: 'table_cell', attrs: function attrs(tok) {
			console.log(tok);return {};
		} },
	th: { block: 'table_cell', attrs: function attrs(tok) {
			console.log(tok);return {};
		} },

	em: { mark: 'em' },
	strong: { mark: 'strong' },
	strike: { mark: 'strike' },
	// s: {mark: 'strike'}, // Used for Migration. Handles strikethroughs more gracefully
	link: { mark: 'link', attrs: function attrs(tok) {
			return {
				href: tok.attrGet('href'),
				title: tok.attrGet('title') || null
			};
		} },
	code_inline: { mark: 'code' },
	sub: { mark: 'sub' },
	sup: { mark: 'sup' }
});

var emptyAdd = function emptyAdd(state, tok) {
	console.log('emptying', tok);
};

markdownParser.tokenHandlers.tbody_open = emptyAdd;
markdownParser.tokenHandlers.tbody_close = emptyAdd;
markdownParser.tokenHandlers.thead_open = emptyAdd;
markdownParser.tokenHandlers.thead_close = emptyAdd;