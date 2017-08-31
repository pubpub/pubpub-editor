import { CitationsView, EmbedView, FootnoteView, HtmlView, IframeView, LatexView, MentionView, ReferenceView } from '.index';

export default {
	embed: (node, view, getPos) => new EmbedView(node, view, getPos, { block: true }),
	equation: (node, view, getPos) => new LatexView(node, view, getPos, { block: false }),
	block_equation: (node, view, getPos) => new LatexView(node, view, getPos, { block: true }),
	mention: (node, view, getPos) => new MentionView(node, view, getPos, { block: false, suggestComponent }),
	reference: (node, view, getPos, decorations) => new ReferenceView(node, view, getPos, { decorations, block: false }),
	citations: (node, view, getPos) => new CitationsView(node, view, getPos, { block: false }),
	iframe: (node, view, getPos) => new IframeView(node, view, getPos, {}),
	html_block: (node, view, getPos) => new HtmlView(node, view, getPos, {}),
	footnote: (node, view, getPos, decorations) => new FootnoteView(node, view, getPos, { decorations, block: false }),
};
