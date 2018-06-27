import { Plugin } from 'prosemirror-state';
import { DecorationSet, Decoration } from 'prosemirror-view';

const linkPlugin = new Plugin({
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

export default linkPlugin;
