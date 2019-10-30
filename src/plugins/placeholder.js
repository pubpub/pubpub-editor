import { Plugin } from 'prosemirror-state';
import { DecorationSet, Decoration } from 'prosemirror-view';
import { collaborativePluginKey } from './collaborative';
import { docIsEmpty } from '../utils';

export default (schema, props) => {
	return new Plugin({
		props: {
			decorations: (state) => {
				const doc = state.doc;
				if (docIsEmpty(doc) && props.placeholder) {
					const placeHolderElem = document.createElement('span');
					placeHolderElem.className = 'prosemirror-placeholder';
					const collaborativePluginState = collaborativePluginKey.getState(state);
					const placeholderText =
						props.collaborativeOptions.firebaseRef && !collaborativePluginState.isLoaded
							? 'Loading...'
							: props.placeholder;
					placeHolderElem.innerHTML = placeholderText;
					return DecorationSet.create(doc, [
						Decoration.widget(doc.childCount, placeHolderElem),
					]);
				}
				return null;
			},
		},
	});
};
