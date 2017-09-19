import { baseKeymap } from 'prosemirror-commands';
import { history } from 'prosemirror-history';
import { keymap } from 'prosemirror-keymap';
import { Plugin } from 'prosemirror-state';
import { DecorationSet, Decoration } from 'prosemirror-view';
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

function placeholderPlugin(text) {
	return new Plugin({
		props: {
			decorations(state) {
				const doc = state.doc;
				if (doc.childCount === 0 || (doc.childCount === 1 && doc.firstChild.isTextblock && doc.firstChild.content.size === 0)) {
					const placeHolderElem = document.createElement('span');
					placeHolderElem.className = 'prosemirror-placeholder';
					placeHolderElem.innerHTML = text;
					return DecorationSet.create(doc, [Decoration.widget(doc.childCount, placeHolderElem)]);
				}
				return null;
			}
		}
	});
}

function getBasePlugins(options) {
	const deps = [
		// inputRules({ rules: allInputRules.concat(buildInputRules(options.schema)) }),
		keymap(buildKeymap(options.schema, options.mapKeys)),
		keymap(baseKeymap),
		SelectPlugin
	];
	if (options.placeholder) { deps.push(placeholderPlugin(options.placeholder)); }
	if (options.history !== false) { deps.push(history()); }

	return deps;
}

exports.getBasePlugins = getBasePlugins;
