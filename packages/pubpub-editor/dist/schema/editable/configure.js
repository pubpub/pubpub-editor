'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _index = require('./index');

exports.default = {
	embed: function embed(node, view, getPos) {
		return new _index.EmbedView(node, view, getPos, { block: true });
	},
	equation: function equation(node, view, getPos) {
		return new _index.LatexView(node, view, getPos, { block: false });
	},
	block_equation: function block_equation(node, view, getPos) {
		return new _index.LatexView(node, view, getPos, { block: true });
	},
	mention: function mention(node, view, getPos) {
		return new _index.MentionView(node, view, getPos, { block: false, suggestComponent: suggestComponent });
	},
	reference: function reference(node, view, getPos, decorations) {
		return new _index.ReferenceView(node, view, getPos, { decorations: decorations, block: false });
	},
	citations: function citations(node, view, getPos) {
		return new _index.CitationsView(node, view, getPos, { block: false });
	},
	iframe: function iframe(node, view, getPos) {
		return new _index.IframeView(node, view, getPos, {});
	},
	html_block: function html_block(node, view, getPos) {
		return new _index.HtmlView(node, view, getPos, {});
	},
	footnote: function footnote(node, view, getPos, decorations) {
		return new _index.FootnoteView(node, view, getPos, { decorations: decorations, block: false });
	}
};