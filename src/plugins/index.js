import { history } from 'prosemirror-history';
import { gapCursor } from 'prosemirror-gapcursor';
import buildOnChange from './onChange';
import buildInputRules from './inputRules';
import buildKeymap from './keymap';
import buildHeaderIds from './headerIds';
import buildPlaceholder from './placeholder';
import buildLocalHighlights from './localHighlights';
import buildTable from './table';
import buildCollaborative from './collaborative';
import buildCitation from './citation';
import buildFootnote from './footnote';

const buildGapCursor = () => {
	return gapCursor();
};

const buildHistory = () => {
	return history();
};

export const requiredPlugins = {
	onChange: buildOnChange,
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
	localHighlights: buildLocalHighlights,
};

export const getPlugins = (schema, props) => {
	const allPlugins = {
		...optionalPlugins,
		...props.customPlugins,
		...requiredPlugins,
	};
	return Object.keys(allPlugins)
		.filter((key) => {
			return !!allPlugins[key];
		})
		.sort((foo, bar) => {
			if (foo === 'onChange') {
				return 1;
			}
			if (bar === 'onChange') {
				return -1;
			}
			return 0;
		})
		.map((key) => {
			return allPlugins[key](schema, props);
		})
		.reduce((prev, curr) => {
			/* Some plugin generation functions return an */
			/* array of plugins. Flatten those cases. */
			return prev.concat(curr);
		}, []);
};
