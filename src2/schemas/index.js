import { baseNodes, baseMarks } from './base';
import iframe from './iframe';
import image from './image';
import video from './video';


export const nodes = {
	...baseNodes,
	...iframe,
	...image,
	...video,
};

export const marks = {
	...baseMarks,
};
