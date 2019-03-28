import { Plugin, PluginKey } from 'prosemirror-state';
import { Decoration, DecorationSet } from 'prosemirror-view';

const localHighlightsPluginKey = new PluginKey('localHighlights');

export default () => {
	return new Plugin({
		key: localHighlightsPluginKey,
		state: {
			init: (config, editorState) => {
				return {
					activeDecorationSet: DecorationSet.create(editorState.doc, []),
				};
			},
			apply: (transaction, pluginState, prevEditorState, editorState) => {
				const prevDecorationSet = pluginState.activeDecorationSet;

				const decorationsToRemove = prevDecorationSet.find().filter((decoration) => {
					const decorationId = decoration.type.attrs.class.replace(
						'local-highlight lh-',
						'',
					);
					return decorationId === transaction.meta.localHighlightIdToRemove;
				});

				const mappedDecorationSet = prevDecorationSet
					.remove(decorationsToRemove)
					.map(transaction.mapping, transaction.doc);

				/* If there is new highlight data, iterate over the data and */
				/* generate the new Decoration objects. */
				const newHighlightsData = transaction.meta.newLocalHighlightData || [];
				const newDecorations = newHighlightsData.map((highlightData) => {
					const highlightFrom = Number(highlightData.from);
					const highlightTo = Number(highlightData.to);
					const highlightClassName = `local-highlight lh-${highlightData.id}`;
					return Decoration.inline(highlightFrom, highlightTo, {
						class: highlightClassName,
					});
				});

				return {
					activeDecorationSet: mappedDecorationSet.add(editorState.doc, newDecorations),
				};
			},
		},
		props: {
			decorations: (editorState) => {
				return localHighlightsPluginKey.getState(editorState).activeDecorationSet;
			},
		},
	});
};
