/* eslint-disable no-param-reassign */
import { Decoration } from 'prosemirror-view';

function compareObjs(a, b) {
	if (a === b) return true;
	for (let p in a) if (a[p] !== b[p]) return false;
	for (let p in b) if (!(p in a)) return false;
	return true;
}

/* This custom Decoration Type is because we don't want the cursor to */
/* be contenteditable="false". This will break spellcheck. So instead */
/* we do a bunch of specific :after elements and custom styles */
/* to build the rich cursor UI */

/* Based off of the Widget Decoration type: */
/* https://github.com/ProseMirror/prosemirror-view/blob/master/src/decoration.js */
export default class CursorType {
	constructor(widget, spec) {
		this.spec = spec || {};
		this.side = this.spec.side || 0;

		if (!this.spec.raw) {
			if (widget.nodeType !== 1) {
				const wrap = document.createElement('span');
				wrap.appendChild(widget);
				widget = wrap;
			}
			widget.contentEditable = true;
			widget.classList.add('ProseMirror-cursor-widget');
		}
		this.widget = widget;
	}

	map(mapping, span, offset, oldOffset) {
		const { pos, deleted } = mapping.mapResult(span.from + oldOffset, this.side < 0 ? -1 : 1);
		return deleted ? null : new Decoration(pos - offset, pos - offset, this);
	}

	valid() { return true; }

	eq(other) {
		return this === other ||
			(other instanceof CursorType && (this.widget === other.widget || this.spec.key) &&
			compareObjs(this.spec, other.spec));
	}
}
