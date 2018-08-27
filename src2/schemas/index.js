import { baseNodes, baseMarks } from './base';
import image from './image';
import video from './video';

export const nodes = {
	...baseNodes,
	...image,
	...video,
};

export const marks = {
	...baseMarks,
};
