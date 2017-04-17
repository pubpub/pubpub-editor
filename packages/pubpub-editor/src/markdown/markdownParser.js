import { CitationEngine } from '../references';
import { MarkdownParser } from 'prosemirror-markdown';
import { Schema } from 'prosemirror-model';
import markdownit from './markdownitInstance';
import { schema as pubSchema } from '../prosemirror-setup/schema';

const markdownSchema = pubSchema;

export const markdownParser = new MarkdownParser(markdownSchema,
	markdownit,
	{
		article: {block: 'article'},

		blockquote: {block: 'blockquote'},
		paragraph: {block: 'paragraph'},
		list_item: {block: 'list_item'},
		bullet_list: {block: 'bullet_list'},
		ordered_list: {block: 'ordered_list', attrs: tok => ({order: +tok.attrGet('order') || 1})},
		heading: {block: 'heading', attrs: tok => ({level: +tok.tag.slice(1)})},
		code_block: {block: 'code_block'},
		fence: {block: 'code_block'},
		html_inline: {node: 'code_block'},
		html_block: {node: 'html_block', attrs: tok => {
			return {content: tok.content};
		}},


		hr: {node: 'horizontal_rule'},
		pagebreak: {node: 'page_break'},
		math_inline: {node: 'equation', attrs: tok => { return {content: tok.content}; }},
		math_block: {node: 'block_equation', attrs: tok => { return {content: tok.content}; }},

		image: {node: 'embed'},
		highlight: {node: 'highlight', attrs: tok => { return {highlightID: tok.attrGet('highlightID') }; }},
		footnote: {node: 'footnote'},

		embed: {node: 'embed'},
		emoji: {node: 'emoji', attrs: tok => ({
			content: tok.content,
			markup: tok.markup,
		})},
		hardbreak: {node: 'hard_break'},

		citations: {node: 'citations'},

		table: {block: 'table'},
		tbody: {block: 'none'},
		thead: {block: 'none'},

		tr: {block: 'table_row'},
		td: {block: 'table_cell'},
		th: {block: 'table_cell'},

		em: {mark: 'em'},
		strong: {mark: 'strong'},
		strike: {mark: 'strike'},
		s: {mark: 'strike'},

		reference: {node: 'reference'},

		link: {block: 'mention', attrs: tok => {
				let text, type, link;
				const titleAttr = tok.attrGet('title');
				const hrefAttr = tok.attrGet('href');
				if (title && title.charAt(0) === '@') {
					type = 'reference';
					text = 'reference';
					url = hrefAttr;
				} else {
					type = 'normal';
					text = titleAttr;
					url = hrefAttr;
				}

				return {type, text, url};
			}
		},
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
	state.top().attrs.columns = rows;
	state.closeNode();
};


const openRow = function(state, tok) {
	state.columns = 0;
	state.rows = state.rows + 1;
	state.openNode(markdownSchema.nodeType("table_row"), attrs({}, tok));
};

const closeRow = function(state, tok) {
	const columns = state.columns;
	state.top().attrs.columns = columns;
	state.closeNode();
};

const addEmbed = function(state, tok) {
	const topNode = state.top();
	let didClose = false;
	if (topNode.type.name === 'paragraph') {
		didClose = true;
		state.closeNode();
	}
	const attrs = {
		filename: tok.attrGet('src'),
		size: tok.attrGet('width'),
		align: tok.attrGet('align')
	};
	const caption = tok.content;

	state.openNode(markdownSchema.nodeType('embed'), attrs);
	if (caption && caption.length > 0) {
		const textnode = markdownSchema.text(caption);
		state.addNode(markdownSchema.nodeType('caption'), {}, textnode);
	}

	state.closeNode();

	if (didClose) {
		state.openNode(topNode.type, topNode.attrs);
	}
};


const addReference = function(state, tok) {

	if (!state.citationsDict) {
		state.citationsDict = {};
		state.citationOrder = [];
	}

	const citationID = tok.attrGet('citationID').slice(1);
	if (!state.citationsDict[citationID]) {
		state.citationOrder.push(citationID);
	}

	const attrs = { citationID: citationID };
	state.addNode(markdownSchema.nodeType('reference'), attrs);
};

const addCitations = function(state, tok) {

	const orderedCitations = state.citationOrder || [];
	state.openNode(markdownSchema.nodeType('citations'), {});

	for (const citationID of orderedCitations) {
			state.addNode(markdownSchema.nodeType('citation'), { citationID:citationID });
	}

	state.closeNode();

};


const addMention = function(state, tok) {
	let type, url;
	const hrefAttr = tok.attrGet('href');
	type = 'normal';
	url = hrefAttr;
	const attrs = {type, url};
	state.openNode(markdownSchema.nodeType('mention'), attrs);
};

markdownParser.tokenHandlers.image = addEmbed;
markdownParser.tokenHandlers.reference = addReference;
markdownParser.tokenHandlers.citations = addCitations;


markdownParser.tokenHandlers.table_open = openTable;
markdownParser.tokenHandlers.table_close = closeTable;

markdownParser.tokenHandlers.tr_open = openRow;
markdownParser.tokenHandlers.tr_close = closeRow;

markdownParser.tokenHandlers.th_open = addParagraph;
markdownParser.tokenHandlers.td_open = addParagraph;

markdownParser.tokenHandlers.th_close = stopParagraph;
markdownParser.tokenHandlers.td_close = stopParagraph;

markdownParser.tokenHandlers.link_open = addMention;


markdownParser.tokenHandlers.tbody_open = emptyAdd;
markdownParser.tokenHandlers.tbody_close = emptyAdd;
markdownParser.tokenHandlers.thead_open = emptyAdd;
markdownParser.tokenHandlers.thead_close = emptyAdd;

markdownParser._parse = markdownParser.parse;

markdownParser.parse = (md, localReferences) => {
	const result = markdownParser._parse(md);
	return result;
}


markdownParser.parseSlice = (md) => {
	return markdownParser.parse(md);
}
