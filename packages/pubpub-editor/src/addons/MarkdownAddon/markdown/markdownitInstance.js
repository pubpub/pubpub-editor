import attrs from 'markdown-it-attrs';
import citations from './markdown-it-citations';
import diff from './markdown-it-diff';
import embed from './markdown-it-embed';
import footnote from './markdown-it-footnotes';
import highlight from './markdown-it-highlight';
import markdownit from 'markdown-it';
import mk from 'markdown-it-katex';
import modifyLinks from './markdown-it-modify-links';
import reference from './markdown-it-reference';
import sub from 'markdown-it-sub';
import sup from 'markdown-it-sup';

export const markdownitInstance = markdownit({
	html: true,
	linkify: true,
})
.use(citations) // Pub Citation Parser
.use(sub) // Subscript
.use(sup) // Superscript
.use(mk) // Latex math
.use(reference) // Reference parser
.use(attrs) // Reference parser
.use(highlight) // Pub Highlight parser
.use(modifyLinks)
.use(embed)
.use(diff)
.use(footnote);

export default markdownitInstance;
