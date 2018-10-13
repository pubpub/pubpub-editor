import { Plugin, PluginKey } from 'prosemirror-state';
import { Decoration, DecorationSet } from 'prosemirror-view';
import * as textQuote from 'dom-anchor-text-quote';

const highlightPluginKey = new PluginKey();

export default (schema, props)=> {
	return new Plugin({
		key: highlightPluginKey,
		state: {
			init(config, editorState) {
				return {
					activeDecorationSet: DecorationSet.create(editorState.doc, [])
				};
			},
			apply(transaction, pluginState, prevEditorState, editorState) {
				const oldDecorationSet = pluginState.activeDecorationSet;
				const decorationsToRemove = transaction.meta.highlightsToRemove || [];
				const mappedDecorationSet = oldDecorationSet.remove(decorationsToRemove).map(transaction.mapping, transaction.doc);

				/* If there is no new highlight data, simply return the mapped decorations. */
				if (!transaction.meta.newHighlightsData) {
					return {
						activeDecorationSet: mappedDecorationSet
					};
				}

				/* If there is new highlight data, iterate over the data and */
				/* generate the new Decoration objects. */
				const newDecorations = transaction.meta.newHighlightsData.map((highlightData)=> {
					const highlightFrom = Number(highlightData.from);
					const highlightTo = Number(highlightData.to);
					const highlightClassName = `highlight ${highlightData.id} ${highlightData.permanent ? 'permanent' : ''}`.trim();
					const contentAtSpecifiedRange = editorState.doc.nodeSize >= highlightFrom && editorState.doc.nodeSize >= highlightTo
						? editorState.doc.textBetween(highlightFrom, highlightTo)
						: '';

					if (contentAtSpecifiedRange === highlightData.exact) {
						/* If the exact value in highlightData is still at the location */
						/* specified in highlightData, simply add the decoration. */
						return Decoration.inline(highlightFrom, highlightTo, { class: highlightClassName });
					}

					/* If there contentAtSpecifiedRange does not match the exact value, */
					/* we need to search for the content. This is a bit fuzzy and not perfect. */
					/* Better technical solutions would be welcome! */
					const range = textQuote.toRange(props.container, {
						exact: highlightData.exact,
						prefix: highlightData.prefix,
						suffix: highlightData.suffix,
					});
					let resolvedStartContainer;
					let resolvedEndContainer;
					if (range) {
						resolvedStartContainer = range.startContainer;
						while (resolvedStartContainer && !resolvedStartContainer.pmViewDesc && resolvedStartContainer.className !== 'ProseMirror') {
							resolvedStartContainer = resolvedStartContainer.parentElement;
						}
						resolvedEndContainer = range.endContainer;
						while (resolvedEndContainer && !resolvedEndContainer.pmViewDesc && resolvedEndContainer.className !== 'ProseMirror') {
							resolvedEndContainer = resolvedEndContainer.parentElement;
						}
					}
					if (range
						&& resolvedStartContainer
						&& resolvedStartContainer.pmViewDesc
						// TODO: This placeholder line is just a quick fix. We need to make sure we don't apply any highlight before the doc is loaded, or that is larger than the doc size
						&& resolvedStartContainer.pmViewDesc.dom.className !== 'prosemirror-placeholder ProseMirror-widget'
						&& resolvedEndContainer
						&& resolvedEndContainer.pmViewDesc
					) {
						const resolvedFrom = editorState.doc.resolve(resolvedStartContainer.pmViewDesc.posAtStart + range.startOffset).pos;
						const resolvedTo = editorState.doc.resolve(resolvedEndContainer.pmViewDesc.posAtStart + range.endOffset).pos;
						return Decoration.inline(resolvedFrom, resolvedTo, { class: highlightClassName });
					}

					/* If the contentAtSpecifiedRange doesn't match exact, and we */
					/* can't find a good match, return null. */
					return null;
				}).filter((decoration)=> {
					/* Invalid decorations are returned as null. Filter those out. */
					return !!decoration;
				});

				return {
					activeDecorationSet: mappedDecorationSet.add(editorState.doc, newDecorations)
				};
			}
		},
		props: {
			decorations(editorState) {
				return highlightPluginKey.getState(editorState).activeDecorationSet;
			}
		},
		appendTransaction: (transactions, prevEditorState, editorState)=> {
			/* activeDecorations are the decorations currently rendered in the doc */
			/* and stored in the highlight plugin's state */
			const activeDecorations = highlightPluginKey.getState(editorState).activeDecorationSet.find();

			/* usedHighlightIds are the ids of the activeDecorations. */
			const usedHighlightIds = activeDecorations.map((decoration)=> {
				return decoration.type.attrs.class.indexOf('highlight') !== -1 && decoration.type.attrs.class.split(' ')[1];
			}).filter((decoration)=> {
				return !!decoration;
			});

			/* inputHighlightIds are the ids of the highlights provided */
			/* through the <Editor /> getHighlights prop. */
			const inputHighlightIds = props.getHighlights().map((item)=> {
				return item.id;
			})

			/* highlightsToAdd are the set of inputHighlights whose id */
			/* is not yet in the usedHighlightIds list */
			const highlightsToAdd = props.getHighlights().filter((item)=> {
				return usedHighlightIds.indexOf(item.id) === -1;
			});

			/* highlightsToRemove are the set of decorations whose id is in */
			/* usedHighlightIds but not in the list of highlight provided */
			/* through the <Editor /> getHighlights prop */
			const highlightsToRemove = activeDecorations.filter((decoration)=> {
				return decoration.type.attrs.class && decoration.type.attrs.class.split(' ').length > 1;
			}).filter((decoration)=> {
				const decorationId = decoration.type.attrs.class.split(' ')[1];
				return inputHighlightIds.indexOf(decorationId) === -1;
			});

			const transaction = editorState.tr;
			transaction.setMeta('highlightsToRemove', highlightsToRemove);
			transaction.setMeta('newHighlightsData', highlightsToAdd);

			return highlightsToRemove.length || highlightsToAdd.length
				? transaction
				: null;
		}
	});
};
