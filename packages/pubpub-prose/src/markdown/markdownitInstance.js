import markdownit from 'markdown-it';
import sub from 'markdown-it-sub';
import sup from 'markdown-it-sup';
import mk from 'markdown-it-katex';
import reference from './markdown-it-reference';
import highlight from './markdown-it-highlight';


export const markdownitInstance = markdownit({
	html: false,
	linkify: true,
})
.disable(['table'])
.use(sub) // Subscript
.use(sup) // Superscript
.use(mk) // Latex math
.use(reference) // Reference parser
.use(highlight); // Pub Highlight parser

export default markdownitInstance;

