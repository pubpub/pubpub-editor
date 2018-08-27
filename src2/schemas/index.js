import { baseNodes, baseMarks } from './base';
import file from './file';
import iframe from './iframe';
import image from './image';
import table from './table';
import video from './video';

export const nodes = {
	...baseNodes,
	...file,
	...iframe,
	...image,
	...table,
	...video,

};

export const marks = {
	...baseMarks,
};
