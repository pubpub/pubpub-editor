import { baseNodes, baseMarks } from './base';
import citation from './citation';
import file from './file';
import footnote from './footnote';
import iframe from './iframe';
import image from './image';
import table from './table';
import video from './video';
import highlightQuote from './highlightQuote';

export const nodes = {
	...baseNodes,
	...citation,
	...file,
	...footnote,
	...iframe,
	...image,
	...table,
	...video,
	...highlightQuote,

};

export const marks = {
	...baseMarks,
};
