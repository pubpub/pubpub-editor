'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.markdownParser = undefined;

var _prosemirrorMarkdown = require('prosemirror-markdown');

var _prosemirrorModel = require('prosemirror-model');

var _markdownitInstance = require('./markdownitInstance');

var _markdownitInstance2 = _interopRequireDefault(_markdownitInstance);

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

var context = {};

var markdownParser = exports.markdownParser = new _prosemirrorMarkdown.MarkdownParser(markdownSchema, _markdownitInstance2.default,
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
	html_inline: { node: 'code_block', attrs: function attrs(tok) {
			console.log(tok);return {};
		} },
	hr: { node: 'horizontal_rule' },
	pagebreak: { node: 'page_break' },
	math_inline: { node: 'equation', attrs: function attrs(tok) {
			console.log(tok);return { content: tok.content };
		} },
	math_block: { node: 'block_equation', attrs: function attrs(tok) {
			console.log(tok);return { content: tok.content };
		} },

	image: { node: 'embed' },

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

	table: { block: 'table' },
	tbody: { block: 'none' },
	thead: { block: 'none' },

	tr: { block: 'table_row' },
	td: { block: 'table_cell' },
	th: { block: 'table_cell' },

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
	// console.log('emptying', tok);
};

function attrs(given, token) {
	return given instanceof Function ? given(token) : given;
}

var addParagraph = function addParagraph(state, tok) {
	state.columns = state.columns + 1;
	state.openNode(markdownSchema.nodeType("table_cell"), attrs({}, tok));
	state.openNode(markdownSchema.nodeType("paragraph"), attrs({}, tok));
};

var stopParagraph = function stopParagraph(state) {
	state.closeNode();
	state.closeNode();
};

var openTable = function openTable(state, tok) {
	state.rows = 0;
	state.openNode(markdownSchema.nodeType("table"), attrs({}, tok));
};

var closeTable = function closeTable(state, tok) {
	var rows = state.rows;
	// the attribute in the tables schema is columns, but it should mean rows
	// so we use the word rows but assign the column attribute
	state.top().attrs.columns = rows;
	state.closeNode();
};

var openRow = function openRow(state, tok) {
	state.columns = 0;
	state.rows = state.rows + 1;
	state.openNode(markdownSchema.nodeType("table_row"), attrs({}, tok));
};

var closeRow = function closeRow(state, tok) {
	var columns = state.columns;
	state.top().attrs.columns = columns;
	state.closeNode();
};

var addEmbed = function addEmbed(state, tok) {
	var topNode = state.top();
	if (topNode.type.name === 'paragraph') {
		state.closeNode();
	}
	var attrs = {
		filename: tok.attrGet('src'),
		size: tok.attrGet('width'),
		align: tok.attrGet('align')
	};
	state.addNode(markdownSchema.nodeType('embed'), attrs);

	state.openNode(topNode.type, topNode.attrs);
};

markdownParser.tokenHandlers.image = addEmbed;

markdownParser.tokenHandlers.table_open = openTable;
markdownParser.tokenHandlers.table_close = closeTable;

markdownParser.tokenHandlers.tr_open = openRow;
markdownParser.tokenHandlers.tr_close = closeRow;

markdownParser.tokenHandlers.th_open = addParagraph;
markdownParser.tokenHandlers.td_open = addParagraph;

markdownParser.tokenHandlers.th_close = stopParagraph;
markdownParser.tokenHandlers.td_close = stopParagraph;

markdownParser.tokenHandlers.tbody_open = emptyAdd;
markdownParser.tokenHandlers.tbody_close = emptyAdd;
markdownParser.tokenHandlers.thead_open = emptyAdd;
markdownParser.tokenHandlers.thead_close = emptyAdd;

markdownParser.parseSlice = function (md) {
	console.log('PARSING THIS');
	console.log(md);
	return markdownParser.parse(md);
};