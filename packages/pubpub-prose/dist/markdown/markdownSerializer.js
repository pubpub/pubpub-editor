'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.markdownSerializer = undefined;

var _ref;

var _prosemirrorMarkdown = require('prosemirror-markdown');

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var markdownSerializer = exports.markdownSerializer = new _prosemirrorMarkdown.MarkdownSerializer((_ref = {
	blockquote: function blockquote(state, node) {
		state.wrapBlock('> ', null, node, function () {
			return state.renderContent(node);
		});
	},
	code_block: function code_block(state, node) {
		if (node.attrs.params === null) {
			state.wrapBlock('    ', null, node, function () {
				return state.text(node.textContent, false);
			});
		} else {
			state.write('```' + node.attrs.params + '\n');
			state.text(node.textContent, false);
			state.ensureNewLine();
			state.write('```');
			state.closeBlock(node);
		}
	},
	heading: function heading(state, node) {
		state.write(state.repeat('#', node.attrs.level) + ' ');
		state.renderInline(node);
		state.closeBlock(node);
	},
	horizontal_rule: function horizontal_rule(state, node) {
		state.write(node.attrs.markup || '---');
		state.closeBlock(node);
	},
	page_break: function page_break(state, node) {
		state.write(node.attrs.markup || '{{pagebreak}}');
		state.closeBlock(node);
	},
	bullet_list: function bullet_list(state, node) {
		state.renderList(node, '  ', function () {
			return (node.attrs.bullet || '*') + ' ';
		});
	},
	ordered_list: function ordered_list(state, node) {
		var start = node.attrs.order || 1;
		var maxW = String(start + node.childCount - 1).length;
		var space = state.repeat(' ', maxW + 2);
		state.renderList(node, space, function (index) {
			var nStr = String(start + index);
			return state.repeat(' ', maxW - nStr.length) + nStr + '. ';
		});
	},
	list_item: function list_item(state, node) {
		state.renderContent(node);
	},
	paragraph: function paragraph(state, node) {
		state.renderInline(node);
		state.closeBlock(node);
	},
	image: function image(state, node) {
		state.write('![' + state.esc(node.attrs.alt || '') + '](' + state.esc(node.attrs.src) + (node.attrs.title ? ' ' + state.quote(node.attrs.title) : '') + ')');
	},
	emoji: function emoji(state, node) {
		state.write(':' + node.attrs.markup + ':');
	},

	embed: function embed(state, node) {
		// state.write('[[source=\"' + node.attrs.source + '\" id=\"' + node.attrs.id + '\" className=\"' + node.attrs.className + '\" align=\"' + node.attrs.align + '\" size=\"' + node.attrs.size + '\" caption=\"' + node.attrs.caption + '\" mode=\"' + node.attrs.mode + '\" data=\"' + encodeURIComponent(JSON.stringify(node.attrs.data)) + '\"]]');
		state.write('\n![');
		state.renderInline(node);
		state.write('](' + state.esc(node.attrs.filename) + ')\n');
	}
}, _defineProperty(_ref, 'emoji', function emoji(state, node) {
	state.write(':' + node.attrs.markup + ':');
}), _defineProperty(_ref, 'caption', function caption(state, node) {
	state.renderInline(node);
}), _defineProperty(_ref, 'equation', function equation(state, node) {
	state.write('$');
	state.renderInline(node);
	state.write('$');
}), _defineProperty(_ref, 'block_equation', function block_equation(state, node) {
	state.write('\n$$');
	state.renderInline(node);
	state.write('$$\n');
}), _defineProperty(_ref, 'reference', function reference(state) {
	state.write('');
}), _defineProperty(_ref, 'citation', function citation(state) {
	state.write('');
}), _defineProperty(_ref, 'citations', function citations(state, node) {
	state.write('');
}), _defineProperty(_ref, 'aside', function aside(state) {
	state.write('');
}), _defineProperty(_ref, 'article', function article(state, node) {
	state.renderContent(node);
}), _defineProperty(_ref, 'hard_break', function hard_break(state) {
	state.write('\\\n');
}), _defineProperty(_ref, 'text', function text(state, node) {
	state.text(node.text);
}), _ref), {
	em: { open: '*', close: '*', mixable: true },
	strong: { open: '**', close: '**', mixable: true },
	sub: { open: '~', close: '~', mixable: true },
	sup: { open: '^', close: '^', mixable: true },
	strike: { open: '~~', close: '~~', mixable: true },
	link: {
		open: '[',
		close: function close(state, mark) {
			return '](' + state.esc(mark.attrs.href) + (mark.attrs.title ? ' ' + state.quote(mark.attrs.title) : '') + ')';
		}
	},
	code: { open: '`', close: '`' }
});