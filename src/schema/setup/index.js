import { baseKeymap } from 'prosemirror-commands';
import { history } from 'prosemirror-history';
import { keymap } from 'prosemirror-keymap';
import { Plugin } from 'prosemirror-state';
// import { gapCursor } from 'prosemirror-gapcursor';
import { DecorationSet, Decoration } from 'prosemirror-view';
import { buildKeymap } from './keymap';
import { buildInputRules } from './inputRules';
import SelectPlugin from './selectPlugin';
import HeaderIdPlugin from './headerIdPlugin';

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

function linkPlugin() {
	return new Plugin({
		props: {
			decorations(state) {
				const type = state.schema.marks.link;
				// const { from, $from, to, empty } = state.selection;
				const { from, $from, empty } = state.selection;
				let isLink = false;
				if (empty) {
					isLink = type.isInSet(state.storedMarks || $from.marks());
				}
				// isLink = state.doc.rangeHasMark(from, to, type);

				if (isLink) {
					let startPos = from - 1;
					let foundStart = false;
					while (!foundStart) {
						if (startPos === 0) { foundStart = true; }
						if (state.doc.rangeHasMark(startPos, startPos, type)) {
							startPos -= 1;
						} else {
							foundStart = true;
						}
					}

					const href = $from.nodeBefore && $from.nodeBefore.marks.reduce((prev, curr)=> {
						if (curr.type.name === 'link') { return curr.attrs.href; }
						return prev;
					}, '');
					if (href) {
						const elemWrapper = document.createElement('span');
						elemWrapper.className = 'prosemirror-link-url';
						const elemStyle = document.createElement('style');
						elemStyle.innerHTML = `.prosemirror-link-url:after { content: "${href}"; display: block; }`;
						elemWrapper.appendChild(elemStyle);
						return DecorationSet.create(state.doc, [Decoration.widget(startPos, elemWrapper)]);
					}
				}
				return null;
			}
		}
	});
}

function getBasePlugins(options) {
	const deps = [
		buildInputRules(options.schema),
		keymap(buildKeymap(options.schema, options.mapKeys)),
		keymap(baseKeymap),
		HeaderIdPlugin,
	];
	if (!options.isReadOnly) {
		deps.push(SelectPlugin);
		deps.push(linkPlugin());
	}
	if (options.placeholder) { deps.push(placeholderPlugin(options.placeholder)); }
	if (options.history !== false) { deps.push(history()); }
	// deps.push(gapCursor());

	return deps;
}

exports.getBasePlugins = getBasePlugins;
