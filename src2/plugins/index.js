import { history } from 'prosemirror-history';
import { baseKeymap } from 'prosemirror-commands';
import { keymap } from 'prosemirror-keymap';
import { gapCursor } from 'prosemirror-gapcursor';
import buildOnChange from './onChange';
import buildInputRules from './inputRules';
import buildKeymap from './keymap';
import buildHeaderIds from './headerIds';
import buildPlaceholder from './placeholder';
import buildHighlights from './highlights';
import buildTable from './table';
import buildCollaborative from './collaborative';
import buildCitation from './citation';
import buildFootnote from './footnote';

const buildGapCursor = ()=> {
	return gapCursor();
};

const buildHistory = ()=> {
	return history();
};

const buildBaseKeymap = ()=> {
	return keymap(baseKeymap);
};

export const requiredPlugins = {
	onChange: buildOnChange,
	gapCursor: buildGapCursor,
	history: buildHistory,
	baseKeymap: buildBaseKeymap,
	keymap: buildKeymap,
	table: buildTable,
	collaborative: buildCollaborative,
	citation: buildCitation,
	footnote: buildFootnote,
};

export const optionalPlugins = {
	inputRules: buildInputRules,
	headerIds: buildHeaderIds,
	placeholder: buildPlaceholder,
	highlights: buildHighlights,
};
