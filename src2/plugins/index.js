import { history } from 'prosemirror-history';
import { baseKeymap } from 'prosemirror-commands';
import { keymap } from 'prosemirror-keymap';
import buildOnChange from './onChange';
import buildInputRules from './inputRules';
import buildKeymap from './keymap';
import buildHeaderIds from './headerIds';
import buildPlaceholder from './placeholder';
import buildHighlights from './highlights';

const buildHistory = ()=> {
	return history();
};

const buildBaseKeymap = ()=> {
	return keymap(baseKeymap);
};

export const requiredPlugins = {
	onChange: buildOnChange,
	history: buildHistory,
	baseKeymap: buildBaseKeymap,
};

export const optionalPlugins = {
	inputRules: buildInputRules,
	keymap: buildKeymap,
	headerIds: buildHeaderIds,
	placeholder: buildPlaceholder,
	highlights: buildHighlights,
};
