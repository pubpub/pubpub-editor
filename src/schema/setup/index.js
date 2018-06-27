import { baseKeymap } from 'prosemirror-commands';
import { history } from 'prosemirror-history';
import { keymap } from 'prosemirror-keymap';
// import { gapCursor } from 'prosemirror-gapcursor';
// import SelectPlugin from './selectPlugin';
import { buildKeymap } from './keymap';
import { buildInputRules } from './inputRules';
import headerIdPlugin from './headerIdPlugin';
import generatePlaceholderPlugin from './placeholderPlugin';

exports.buildKeymap = buildKeymap;

function getBasePlugins(options) {
	const deps = [
		buildInputRules(options.schema),
		keymap(buildKeymap(options.schema, options.mapKeys)),
		keymap(baseKeymap),
		headerIdPlugin,
	];
	if (!options.isReadOnly) {
		/* It's not clear that the SelectPlugin is used by anything */
		// deps.push(SelectPlugin);
	}
	if (options.placeholder) { deps.push(generatePlaceholderPlugin(options.placeholder)); }
	if (options.history !== false) { deps.push(history()); }
	// deps.push(gapCursor());

	return deps;
}

exports.getBasePlugins = getBasePlugins;
