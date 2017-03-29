import highlight from './markdown-it-highlight';
import markdownit from 'markdown-it';
import mk from 'markdown-it-katex';
import reference from './markdown-it-reference';
import sub from 'markdown-it-sub';
import sup from 'markdown-it-sup';

export const markdownitInstance = markdownit({
	html: false,
	linkify: true,
})
.use(sub) // Subscript
.use(sup) // Superscript
.use(mk) // Latex math
.use(reference) // Reference parser
.use(highlight); // Pub Highlight parser

export default markdownitInstance;
