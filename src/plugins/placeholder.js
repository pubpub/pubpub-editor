import { Plugin } from 'prosemirror-state';
import { DecorationSet, Decoration } from 'prosemirror-view';
import { docIsEmpty } from '../utils';

export default (schema, props) => {
	return new Plugin({
		props: {
			decorations: (state) => {
				const doc = state.doc;
				if (docIsEmpty(doc)) {
					const placeHolderElem = document.createElement('span');
					placeHolderElem.className = 'prosemirror-placeholder';
					placeHolderElem.innerHTML = props.placeholder;
					return DecorationSet.create(doc, [
						Decoration.widget(doc.childCount, placeHolderElem),
					]);
				}
				return null;
			},
		},
	});
};
