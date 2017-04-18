'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.markdownSerializer = undefined;

var _ref;

var _prosemirrorMarkdown = require('prosemirror-markdown');

var _citationConversion = require('../references/citationConversion');

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
		state.write(node.textContent);
		state.write('](' + state.esc(node.attrs.filename) + ')');
		if (node.attrs.align || node.attrs.size || node.attrs.caption) {
			var alignText = node.attrs.align ? 'align=' + node.attrs.align : '';
			var sizeText = node.attrs.size ? 'width=' + node.attrs.size : '';
			state.write('{' + alignText + ' ' + sizeText + '}');
		}
		state.write('\n');
	}
}, _defineProperty(_ref, 'emoji', function emoji(state, node) {
	state.write(':' + node.attrs.markup + ':');
}), _defineProperty(_ref, 'caption', function caption(state, node) {
	state.renderInline(node);
}), _defineProperty(_ref, 'equation', function equation(state, node) {

	var content = void 0;
	if (node.attrs.content) {
		content = node.attrs.content;
	} else if (node && this.node.firstChild) {
		content = node.firstChild.text;
	}

	state.write('$');
	state.write(content);
	state.write('$');
}), _defineProperty(_ref, 'block_equation', function block_equation(state, node) {

	var content = void 0;
	if (node.attrs.content) {
		content = node.attrs.content;
	} else if (node && node.firstChild) {
		content = node.firstChild.text;
	}

	state.write('\n$$');
	state.write(content);
	state.write('$$\n');
}), _defineProperty(_ref, 'html_block', function html_block(state, node) {
	state.write('\n');
	state.write(node.attrs.content);
	state.write('\n');
}), _defineProperty(_ref, 'mention', function mention(state, node) {
	state.write('[' + node.textContent + '](' + node.attrs.url + ')');
}), _defineProperty(_ref, 'reference', function reference(state, node) {
	state.write('[@' + node.attrs.citationID + ']');
}), _defineProperty(_ref, 'highlight', function reference(state, node) {
	state.write('[@highlight/' + node.attrs.highlightID + ']');
}), _defineProperty(_ref, 'citation', function citation(state, node) {
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
}), _defineProperty(_ref, 'iframe', function iframe(state, node) {
	var _node$attrs = node.attrs,
	    url = _node$attrs.url,
	    height = _node$attrs.height,
	    width = _node$attrs.width;

	state.write('\n<iframe src=' + url + ' width=' + width + ' height=' + height + '></iframe>\n');
}), _defineProperty(_ref, 'table', function table(state, node) {
	state.write('\n');
	var rowCount = undefined;

	var renderRow = function renderRow(row) {
		var countedRows = 0;
		row.forEach(function (rowChild, _, i) {
			state.render(rowChild, row, i);
			countedRows++;
		});
		state.write('|');
		state.write('\n');
		if (!rowCount) {
			rowCount = countedRows;
		}
	};

	var renderHeaderDivider = function renderHeaderDivider() {
		var a = void 0;
		for (a = 0; a < rowCount; a++) {
			state.write('|---------');
		}
		state.write('|');
		state.write('\n');
	};

	node.forEach(function (child, _, i) {
		renderRow(child);
		if (i === 0 && rowCount) {
			renderHeaderDivider();
		}
	});
	// state.renderInline(node);
	state.write('\n');
}), _defineProperty(_ref, 'table_cell', function table_cell(state, node) {
	state.write('|');
	node.forEach(function (child, _, i) {
		state.renderInline(child);
	});
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