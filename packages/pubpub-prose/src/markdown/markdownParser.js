import { MarkdownParser } from 'prosemirror-markdown';
import { Schema } from 'prosemirror-model';
import markdownit from './markdownitInstance';
import { schema as pubSchema } from '../prosemirror-setup/schema';
/*
import pagebreak from './markdown-it-pagebreak';
import sub from 'markdown-it-sub';
import sup from 'markdown-it-sup';
import emoji from 'markdown-it-emoji';
*/

const newSpec = pubSchema.spec;
newSpec.topNode = "article";

const markdownSchema = new Schema(newSpec);

const context = {};

export const markdownParser = new MarkdownParser(markdownSchema,
	markdownit,
		/*
	.use(emoji)
	.use(sub)
	.use(sup)
	.use(pagebreak)
	.use(embed),
	*/
	{
		blockquote: {block: 'blockquote'},
		paragraph: {block: 'paragraph'},
		list_item: {block: 'list_item'},
		bullet_list: {block: 'bullet_list'},
		ordered_list: {block: 'ordered_list', attrs: tok => ({order: +tok.attrGet('order') || 1})},
		heading: {block: 'heading', attrs: tok => ({level: +tok.tag.slice(1)})},
		code_block: {block: 'code_block'},
		fence: {block: 'code_block'},
		html_inline: {node: 'code_block', attrs: tok => {console.log(tok); return {}; }},
		hr: {node: 'horizontal_rule'},
		pagebreak: {node: 'page_break'},
		math_inline: {node: 'equation', attrs: tok => {console.log(tok); return {content: tok.content}; }},
		math_block: {node: 'block_equation', attrs: tok => {console.log(tok); return {content: tok.content}; }},

		/*
		image: {node: 'image', attrs: tok => ({
			src: tok.attrGet('src'),
			title: tok.attrGet('title') || null,
			alt: tok.children[0] && tok.children[0].content || null
		})},
		*/
		embed: {node: 'embed', attrs: tok => ({
			source: tok.attrGet('source'),
			className: tok.attrGet('className') || null,
			id: tok.attrGet('id') || null,
			align: tok.attrGet('align') || null,
			size: tok.attrGet('size') || null,
			caption: tok.attrGet('caption') || null,
			mode: tok.attrGet('mode') || 'embed',
			data: JSON.parse(decodeURIComponent(tok.attrGet('data'))) || null,
		})},
		emoji: {node: 'emoji', attrs: tok => ({
			content: tok.content,
			markup: tok.markup,
		})},
		hardbreak: {node: 'hard_break'},

		table: {block: 'table'},
		tbody: {block: 'none'},
		thead: {block: 'none'},

		tr: {block: 'table_row'},
		td: {block: 'table_cell'},
		th: {block: 'table_cell'},

		em: {mark: 'em'},
		strong: {mark: 'strong'},
		strike: {mark: 'strike'},
		// s: {mark: 'strike'}, // Used for Migration. Handles strikethroughs more gracefully
		link: {mark: 'link', attrs: tok => ({
			href: tok.attrGet('href'),
			title: tok.attrGet('title') || null
		})},
		code_inline: {mark: 'code'},
		sub: {mark: 'sub'},
		sup: {mark: 'sup'},
	}
);

const emptyAdd = function(state, tok) {
	// console.log('emptying', tok);
};

function attrs(given, token) {
  return given instanceof Function ? given(token) : given
}

const addParagraph = function(state, tok) {
	state.columns = state.columns + 1;
	state.openNode(markdownSchema.nodeType("table_cell"), attrs({}, tok));
	state.openNode(markdownSchema.nodeType("paragraph"), attrs({}, tok));
};

const stopParagraph = function(state) {
	state.closeNode();
	state.closeNode();
};

const openTable = function(state, tok) {
	state.rows = 0;
	state.openNode(markdownSchema.nodeType("table"), attrs({}, tok));
};

const closeTable = function(state, tok) {
	const rows = state.rows;
	// the attribute in the tables schema is columns, but it should mean rows
	// so we use the word rows but assign the column attribute
	state.stack[state.stack.length - 1].attrs.columns = rows;
	state.closeNode();
};


const openRow = function(state, tok) {
	state.columns = 0;
	state.rows = state.rows + 1;
	state.openNode(markdownSchema.nodeType("table_row"), attrs({}, tok));
};

const closeRow = function(state, tok) {
	const columns = state.columns;
	state.stack[state.stack.length - 1].attrs.columns = columns;
	state.closeNode();
};

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
