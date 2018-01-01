/* eslint-disable react/prop-types */
import React from 'react';

const nodes = {
	doc: {
		content: 'block+',
		attrs: {
			meta: { default: {} },
		},
	},
	paragraph: {
		content: 'inline*',
		group: 'block',
		attrs: {
			class: { default: null },
		},
		parseDOM: [
			{
				tag: 'p',
				getAttrs(dom) {
					return {
						class: dom.getAttribute('class'),
					};
				}
			}
		],
		toDOM(node) { return ['p', node.attrs, 0]; },
		toStatic(node, children) {
			const attrs = {};
			if (node.attrs && node.attrs.class) { attrs.className = node.attrs.class; }
			return <p {...attrs} key={node.currIndex}>{children}</p>;
		}
	},
	blockquote: {
		content: 'block+',
		group: 'block',
		parseDOM: [{ tag: 'blockquote' }],
		toDOM() { return ['blockquote', 0]; },
		toStatic(node, children) {
			return <blockquote key={node.currIndex}>{children}</blockquote>;
		}
	},
	horizontal_rule: {
		group: 'block',
		parseDOM: [{ tag: 'hr' }],
		toDOM() { return ['div', ['hr']]; },
		insertMenu: {
			label: 'Insert Horizontal Line',
			icon: 'pt-icon-minus',
			onInsert: (view) => {
				view.dispatch(view.state.tr.replaceSelectionWith(view.state.schema.nodes.horizontal_rule.create()));
			},
		},
		toStatic(node) {
			return <hr key={node.currIndex} />;
		}
	},
	heading: {
		attrs: { level: { default: 1 } },
		content: 'inline*',
		group: 'block',
		parseDOM: [
			{ tag: 'h1', attrs: { level: 1 } },
			{ tag: 'h2', attrs: { level: 2 } },
			{ tag: 'h3', attrs: { level: 3 } },
			{ tag: 'h4', attrs: { level: 4 } },
			{ tag: 'h5', attrs: { level: 5 } },
			{ tag: 'h6', attrs: { level: 6 } }
		],
		toDOM(node) { return [`h${node.attrs.level}`, 0]; },
		toStatic(node, children) {
			if (node.attrs.level === 1) { return <h1 key={node.currIndex}>{children}</h1>; }
			if (node.attrs.level === 2) { return <h2 key={node.currIndex}>{children}</h2>; }
			if (node.attrs.level === 3) { return <h3 key={node.currIndex}>{children}</h3>; }
			if (node.attrs.level === 4) { return <h4 key={node.currIndex}>{children}</h4>; }
			if (node.attrs.level === 5) { return <h5 key={node.currIndex}>{children}</h5>; }
			if (node.attrs.level === 6) { return <h6 key={node.currIndex}>{children}</h6>; }
			return null;
		}
	},
	code_block: {
		content: 'text*',
		group: 'block',
		code: true,
		parseDOM: [{ tag: 'pre', preserveWhitespace: true }],
		toDOM() { return ['pre', ['code', 0]]; },
		insertMenu: {
			label: 'Insert Code Block',
			icon: 'pt-icon-code',
			onInsert: (view) => {
				view.dispatch(view.state.tr.replaceSelectionWith(view.state.schema.nodes.code_block.create()));
			},
		},
		toStatic(node, children) {
			return <pre key={node.currIndex}><code>{children}</code></pre>;
		}
	},
	text: {
		group: 'inline',
		toDOM(node) { return node.text; },
		toStatic(node, children) {
			return <span key={node.currIndex}>{children}</span>;
		}
	},
	hard_break: {
		inline: true,
		group: 'inline',
		selectable: false,
		parseDOM: [{ tag: 'br' }],
		toDOM() { return ['br']; },
		toStatic(node) {
			return <br key={node.currIndex} />;
		}
	},
	none: {
		// empty schema block
		group: 'block',
		toDOM() { return ['span']; },
		toStatic(node, children) {
			return <span key={node.currIndex}>{children}</span>;
		}
	},
};

const marks = {
	em: {
		parseDOM: [
			{ tag: 'i' },
			{ tag: 'em' },
			{
				style: 'font-style',
				getAttrs: value => value === 'italic' && null
			}
		],
		toDOM() { return ['em']; },
		toStatic(mark, children) {
			return <em>{children}</em>;
		}
	},

	strong: {
		parseDOM: [
			{ tag: 'strong' },
			// This works around a Google Docs misbehavior where
			// pasted content will be inexplicably wrapped in `<b>`
			// tags with a font-weight normal.
			{ tag: 'b', getAttrs: node => node.style.fontWeight !== 'normal' && null },
			{ style: 'font-weight', getAttrs: value => /^(bold(er)?|[5-9]\d{2,})$/.test(value) && null }
		],
		toDOM() { return ['strong']; },
		toStatic(mark, children) {
			return <strong>{children}</strong>;
		}
	},
	link: {
		attrs: {
			href: { default: '' },
			title: { default: null },
			target: { default: null },
		},
		parseDOM: [
			{
				tag: 'a[href]',
				getAttrs(dom) {
					return {
						href: dom.getAttribute('href'),
						title: dom.getAttribute('title'),
						target: dom.getAttribute('target'),
					};
				}
			}
		],
		toDOM(node) { return ['a', node.attrs]; },
		toStatic(mark, children) {
			return (
				<a
					href={mark.attrs.href}
					title={mark.attrs.title}
					target={mark.attrs.target}
				>
					{children}
				</a>
			);
		}
	},
	sub: {
		parseDOM: [{ tag: 'sub' }],
		toDOM() { return ['sub']; },
		toStatic(mark, children) {
			return <sub>{children}</sub>;
		}
	},
	sup: {
		parseDOM: [{ tag: 'sup' }],
		toDOM() { return ['sup']; },
		toStatic(mark, children) {
			return <sup>{children}</sup>;
		}
	},
	strike: {
		parseDOM: [{ tag: 's' }],
		toDOM() { return ['s']; },
		toStatic(mark, children) {
			return <s>{children}</s>;
		}
	},
	code: {
		parseDOM: [{ tag: 'code' }],
		toDOM() { return ['code']; },
		toStatic(mark, children) {
			return <code>{children}</code>;
		}
	}
};


exports.marks = marks;
exports.nodes = nodes;
