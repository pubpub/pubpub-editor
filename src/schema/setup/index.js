import { baseKeymap } from 'prosemirror-commands';
import { history } from 'prosemirror-history';
import { keymap } from 'prosemirror-keymap';
import { buildKeymap } from './keymap';
import SelectPlugin from './selectPlugin';

exports.buildKeymap = buildKeymap;

/*
	// Block Cntrl-S from launching the Browser Save window
	document.getElementsByClassName('ProseMirror')[0].addEventListener('keydown', function(evt) {
		if (evt.keyCode === 83 && (navigator.platform.match('Mac') ? evt.metaKey : evt.ctrlKey)) {
			evt.preventDefault();
			evt.stopPropagation();
		}
	}, false);
*/

function getBasePlugins(options) {
	const deps = [
		// inputRules({ rules: allInputRules.concat(buildInputRules(options.schema)) }),
		keymap(buildKeymap(options.schema, options.mapKeys)),
		keymap(baseKeymap),
		SelectPlugin
	];
	if (options.history !== false) deps.push(history());

	return deps;
}

exports.getBasePlugins = getBasePlugins;
