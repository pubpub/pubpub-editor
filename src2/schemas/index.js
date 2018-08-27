import { baseNodes, baseMarks } from './base';
import citation from './citation';
import file from './file';
import footnote from './footnote';
import iframe from './iframe';
import image from './image';
import table from './table';
import video from './video';

export const nodes = {
	...baseNodes,
	...citation,
	...file,
	...footnote,
	...iframe,
	...image,
	...table,
	...video,

};

export const marks = {
	...baseMarks,
};
