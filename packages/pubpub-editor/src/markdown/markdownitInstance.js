import attrs from 'markdown-it-attrs';
import citations from './markdown-it-citations';
import highlight from './markdown-it-highlight';
import markdownit from 'markdown-it';
import mk from 'markdown-it-katex';
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
.use(highlight); // Pub Highlight parser

export default markdownitInstance;
