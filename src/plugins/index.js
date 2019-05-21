import { history } from 'prosemirror-history';
import { gapCursor } from 'prosemirror-gapcursor';
import buildOnChange from './onChange';
import buildInputRules from './inputRules';
import buildKeymap from './keymap';
import buildHeaderIds from './headerIds';
import buildPlaceholder from './placeholder';
import buildHighlights from './highlights';
import buildLocalHighlights from './localHighlights';
import buildTable from './table';
import buildCollaborative from './collaborative';
import buildCitation from './citation';
import buildFootnote from './footnote';
// import buildTrackChanges from './trackChanges';

const buildGapCursor = () => {
	return gapCursor();
};

const buildHistory = () => {
	return history();
};

export const requiredPlugins = {
	onChange: buildOnChange,
	// trackChanges: buildTrackChanges,
	gapCursor: buildGapCursor,
	history: buildHistory,
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
	localHighlights: buildLocalHighlights,
};
