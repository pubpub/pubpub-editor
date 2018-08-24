import { history } from 'prosemirror-history';
import buildOnChange from './onChange';
import buildInputRules from './inputRules';
import buildKeymap from './keymap';
import buildHeaderIds from './headerIds';
import buildPlaceholder from './placeholder';

const buildHistory = ()=> {
	return history();
};

export const requiredPlugins = {
	onChange: buildOnChange,
	history: buildHistory,
};

export const optionalPlugins = {
	inputRules: buildInputRules,
	keymap: buildKeymap,
	headerIds: buildHeaderIds,
	placeholder: buildPlaceholder,
};
