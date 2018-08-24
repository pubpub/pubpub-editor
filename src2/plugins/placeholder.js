import { Plugin } from 'prosemirror-state';
import { DecorationSet, Decoration } from 'prosemirror-view';

export default (schema, props)=> {
	return new Plugin({
		props: {
			decorations(state) {
				const doc = state.doc;
				if (doc.childCount === 0 || (doc.childCount === 1 && doc.firstChild.isTextblock && doc.firstChild.content.size === 0)) {
					const placeHolderElem = document.createElement('span');
					placeHolderElem.className = 'prosemirror-placeholder';
					placeHolderElem.innerHTML = props.placeholder;
					return DecorationSet.create(doc, [Decoration.widget(doc.childCount, placeHolderElem)]);
				}
				return null;
			}
		}
	});
};
