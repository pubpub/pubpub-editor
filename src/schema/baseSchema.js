const nodes = {
	doc: {
		content: 'block+',
		attrs: {
			meta: { default: {} },
		}
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
		toDOM(node) { return ['p', node.attrs, 0]; }
	},
	blockquote: {
		content: 'block+',
		group: 'block',
		parseDOM: [{ tag: 'blockquote' }],
		toDOM() { return ['blockquote', 0]; },
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
	},
	text: {
		group: 'inline',
		toDOM(node) { return node.text; },
		// toReact({ node, index }) {
		// 	const marks = node.marks || [];
		// 	const style = {};
		// 	return marks.reduce((previous, current) => {
		// 		switch (current.type) {
		// 		case 'strong':
		// 			return <strong key={index}>{previous}</strong>;
		// 		case 'em':
		// 			return <em key={index}>{previous}</em>;
		// 		case 'code':
		// 			return <code key={index}>{previous}</code>;
		// 		case 'sub':
		// 			return <sub key={index}>{previous}</sub>;
		// 		case 'sup':
		// 			return <sup key={index}>{previous}</sup>;
		// 		case 's':
		// 		case 'strike':
		// 			return <s key={index}>{previous}</s>;
		// 		case 'diff_plus':
		// 			return <span data-commit={current.attrs.commitID} className="diff-marker added" >{previous}</span>;
		// 		case 'diff_minus':
		// 			return <span data-commit={current.attrs.commitID} className="diff-marker removed" >{previous}</span>;
		// 		case 'link':
		// 			if (current.attrs) {
		// 				return <a href={current.attrs.href} title={current.attrs.title} key={index} target={'_top'}>{previous}</a>;
		// 			}
		// 			return previous;
		// 		default:
		// 			return previous;
		// 		}
		// 	}, <span style={style}>{node.text}</span>);
		// }
	},
	hard_break: {
		inline: true,
		group: 'inline',
		selectable: false,
		parseDOM: [{ tag: 'br' }],
		toDOM() { return ['br']; },
	},
	none: {
		// empty schema block
		group: 'block',
		toDOM() { return ['span']; }
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
		toDOM() { return ['em']; }
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
		toDOM() { return ['strong']; }
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
		toDOM(node) { return ['a', node.attrs]; }
	},
	sub: {
		parseDOM: [{ tag: 'sub' }],
		toDOM() { return ['sub']; }
	},
	sup: {
		parseDOM: [{ tag: 'sup' }],
		toDOM() { return ['sup']; }
	},
	strike: {
		parseDOM: [{ tag: 's' }],
		toDOM() { return ['s']; }
	},
	code: {
		parseDOM: [{ tag: 'code' }],
		toDOM() { return ['code']; }
	}
};


exports.marks = marks;
exports.nodes = nodes;
