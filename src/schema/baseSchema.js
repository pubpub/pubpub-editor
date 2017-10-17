/* eslint-disable react/prop-types */
import React from 'react';
// import { CitationsRender, EmbedRender, FootnoteRender, HtmlRender, IframeRender, LatexRender, MentionRender, ReferenceRender } from './render/components';

// import { CitationEngine } from '../references';


/*
export default {
	embed: (node, view, getPos) => new EmbedView(node, view, getPos, { block: true }),
	equation: (node, view, getPos) => new LatexView(node, view, getPos, { block: false }),
	block_equation: (node, view, getPos) => new LatexView(node, view, getPos, { block: true }),
	mention: (node, view, getPos) => new MentionView(node, view, getPos, { block: false, suggestComponent }),
	reference: (node, view, getPos, decorations) => new ReferenceView(node, view, getPos, { decorations, block: false }),
	citations: (node, view, getPos) => new CitationsView(node, view, getPos, { block: false }),
	iframe: (node, view, getPos) => new IframeView(node, view, getPos, {}),
	html_block: (node, view, getPos) => new HtmlView(node, view, getPos, {}),
	footnote: (node, view, getPos, decorations) => new FootnoteView(node, view, getPos, { decorations, block: false }),
};
*/

const nodes = {

	doc: {
		content: 'block+',
		attrs: {
			meta: { default: {} },
		}
	},

	/*
	article: {
		content: 'block+',
		parseDOM: [{ tag: 'div.article' }],
		toDOM(node) { return ['div', { class: 'article' }, 0]; }
	},
	*/

	paragraph: {
		content: 'inline*',
		group: 'block',
		parseDOM: [{ tag: 'p' }],
		toDOM() { return ['p', 0]; },
		// toReact({ node, renderContent, meta, index }) {
		// 	return <div className={'p-block'} key={index}>{renderContent(node.content, meta)}</div>;
		// }
	},

	// highlight: {
	// 	group: 'inline',
	// 	inline: true,
	// 	attrs: {
	// 		highlightID: { default: null },
	// 	},
	// 	toDOM() { return ['div', 0]; }
	// },


	// mention: {
	// 	content: 'inline<_>*',
	// 	atom: true,
	// 	group: 'inline',
	// 	attrs: {
	// 		url: { default: '' },
	// 		type: { default: ' ' }
	// 	},
	// 	inline: true,
	// 	toReact({ node, renderContent, meta, index }) {
	// 		let mentionURL = node.attrs.url;
	// 		if (meta.fileMap[mentionURL]) {
	// 			mentionURL = `/pub/${meta.slug}/files/${mentionURL}`;
	// 		}
	// 		return <MentionRender key={index} type={node.attrs.type} url={mentionURL}>{renderContent(node.content, meta)}</MentionRender>
	// 	}
	// },

	// equation: {
	// 	atom: true,
	// 	group: 'inline',
	// 	content: 'inline<_>*',
	// 	attrs: {
	// 		content: { default: '' },
	// 	},
	// 	inline: true,
	// 	toReact({ node, index }) {
	// 		let equationText;
	// 		if (node.content && node.content.length >= 1)  {
	// 			equationText = node.content[0].text
	// 		} else if (node.attrs.content) {
	// 			equationText = node.attrs.content;
	// 		}
	// 		return <LatexRender key={index} value={equationText} block={false} />
	// 	}
	// },

	// block_equation: {
	// 	atom: true,
	// 	group: 'block',
	// 	content: 'inline<_>*',
	// 	attrs: {
	// 		content: { default: '' },
	// 	},
	// 	toReact({ node, index }) {
	// 		let equationText;
	// 		if (node.content && node.content.length >= 1)  {
	// 			equationText = node.content[0].text
	// 		} else if (node.attrs.content) {
	// 			equationText = node.attrs.content;
	// 		}
	// 		return <LatexRender key={index} value={equationText} block={true} />
	// 	}
	// },

	// citations: {
	// 	atom: true,
	// 	content: 'citation*',
	// 	group: 'block',
	// 	parseDOM: [{ tag: 'hr.citations' }],
	// 	selectable: false,
	// 	toDOM() { return ['div', ['hr']]; },
	// 	toReact({ node, index, meta }) {
	// 		let bib;
	// 			if (meta.docAttrs && meta.docAttrs.bib) {
	// 			bib = meta.docAttrs.bib;
	// 		}
	// 		return <CitationsRender key={index} renderedBib={bib} {...node.attrs} citations={node.content} />
	// 	}
	// },

	// citation: {
	// 	attrs: {
	// 		data: { default: {} },
	// 		citationID: { default: null },
	// 	},
	// 	group: 'footer',
	// 	selectable: false,
	// 	toDOM() { return ['div']; },
	// 	toReact({ node, index, meta }) {
	// 		let bib;
	// 		if (meta.docAttrs && meta.docAttrs.bib) {
	// 			bib = meta.docAttrs.bib;
	// 		}
	// 		return <CitationsRender key={index} renderedBib={bib} {...node.attrs} citations={node.content} />
	// 	}
	// },

	// reference: {
	// 	atom: true,
	// 	inline: true,
	// 	attrs: {
	// 		citationID: { default: null },
	// 		referenceID: { default: null },
	// 	},
	// 	group: 'inline',
	// 	toReact({ node, index }) {
	// 		const citationID = node.attrs.citationID;
	// 		let label;
	// 		if (meta.docAttrs && meta.docAttrs.inlineBib) {
	// 			label = meta.docAttrs.inlineBib[citationID];
	// 		}
	// 		return <ReferenceRender citationID={citationID} key={index} label={label} {...node.attrs} />
	// 	},
	// },

	// iframe: {
	// 	attrs: {
	// 		url: { default: null },
	// 		height: { default: null },
	// 		width: { default: null },
	// 	},
	// 	group: 'block',
	// 	toReact({ node, index }) {
	// 		return <IframeRender key={index} {...node.attrs} />
	// 	}
	// },

	// embed: {
	// 	atom: true,
	// 	content: 'caption?',
	// 	attrs: {
	// 		filename: { default: '' },
	// 		url: { default: '' },
	// 		figureName: { default: '' },
	// 		size: { default: '' },
	// 		align: { default: '' },
	// 	},
	// 	parseDOM: [{ tag: 'img[src]' }],
	// 	inline: false,
	// 	group: 'block',
	// 	draggable: false,
	// 	selectable: true,
	// 	toReact({ node, index, renderContent }) {
	// 		const filename = node.attrs.filename;
	// 		const url = meta.fileMap[filename];
	// 		return <EmbedRender key={index} {...node.attrs} url={url}>{renderContent(node.content, meta)}</EmbedRender>
	// 	},
	// 	toEditable({}) {
	// 		return <EmbedView />
	// 	}
	// },

	// caption: {
	// 	content: 'inline<_>*',
	// 	group: 'block',
	// 	parseDOM: [{ tag: 'p' }],
	// 	toDOM() { return ['p', 0]; }
	// },

	// // removable, but think some legacy docs may use this
	// aside: {
	// 	content: 'inline<_>*',
	// 	group: 'block',
	// 	parseDOM: [{ tag: 'aside' }],
	// 	toDOM() { return ['aside']; }
	// },

	// footnote: {
	// 	atom: true,
	// 	inline: true,
	// 	attrs: {
	// 		content: { default: '' },
	// 	},
	// 	group: 'inline',
	// 	parseDOM: [{ tag: 'aside' }],
	// 	toDOM() { return ['aside']; },
	// 	toReact({ node, index, renderContent, meta }) {
	// 		if (!meta.footnoteCount) {
	// 			meta.footnoteCount = 0;
	// 		}
	// 		meta.footnoteCount = meta.footnoteCount + 1;
	// 		return <FootnoteRender content={node.attrs.content} label={meta.footnoteCount} />
	// 	}
	// },

	// caption: {
	// 	content: 'inline*',
	// 	group: 'block',
	// 	parseDOM: [{ tag: 'p' }],
	// 	toDOM() { return ['p', 0]; }
	// },

	blockquote: {
		content: 'block+',
		group: 'block',
		parseDOM: [{ tag: 'blockquote' }],
		toDOM() { return ['blockquote', 0]; },
		// toReact({ node, index, renderContent }) {
		// 	return <blockquote key={index}>{renderContent(node.content, meta)}</blockquote>;
		// }
	},

	horizontal_rule: {
		group: 'block',
		parseDOM: [{ tag: 'hr' }],
		toDOM() { return ['div', ['hr']]; },
		// toReact({ node, index, renderContent }) {
		// 	return <hr key={index} />;
		// },
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
		toDOM(node) { return ['h' + node.attrs.level, 0]; },
		// toReact({ node, index, renderContent }) {
		// 	if (!node.content) { return null; }
		// 	const id = node.content[0] && node.content[0].text && node.content[0].text.trim().replace(/[^A-Za-z0-9 ]/g, '').replace(/\s/g, '-').toLowerCase();
		// 	return React.createElement('h' + node.attrs.level, {key: index, id: id}, renderContent(node.content, meta));
		// }
	},

	code_block: {
		content: 'text*',
		group: 'block',
		code: true,
		parseDOM: [{ tag: 'pre', preserveWhitespace: true }],
		toDOM() { return ['pre', ['code', 0]]; },
		// toReact({ node, index, renderContent }) {
		// 	return <pre key={index}><code>{renderContent(node.content, meta)}</code></pre>;
		// },
		insertMenu: {
			label: 'Insert Code Block',
			icon: 'pt-icon-code',
			onInsert: (view) => {
				view.dispatch(view.state.tr.replaceSelectionWith(view.state.schema.nodes.code_block.create()));
			},
		},
	},

	// html_block: {
	// 	atom: true,
	// 	attrs: {
	// 		content: { default: '' },
	// 	},
	// 	parseDOM: [{ tag: 'div.customHTML' }],
	// 	inline: false,
	// 	group: 'block',
	// 	draggable: false,
	// 	selectable: true,
	// 	toReact({ node, index }) {
	// 		return <HtmlRender key={index} {...node.attrs} />
	// 	}
	// },

	text: {
		group: 'inline',
		toDOM(node) { return node.text; },
		toReact({ node, index }) {
			const marks = node.marks || [];
			const style = {};
			return marks.reduce((previous, current) => {
				switch (current.type) {
				case 'strong':
					return <strong key={index}>{previous}</strong>;
				case 'em':
					return <em key={index}>{previous}</em>;
				case 'code':
					return <code key={index}>{previous}</code>;
				case 'sub':
					return <sub key={index}>{previous}</sub>;
				case 'sup':
					return <sup key={index}>{previous}</sup>;
				case 's':
				case 'strike':
					return <s key={index}>{previous}</s>;
				case 'diff_plus':
					return <span data-commit={current.attrs.commitID} className="diff-marker added" >{previous}</span>;
				case 'diff_minus':
					return <span data-commit={current.attrs.commitID} className="diff-marker removed" >{previous}</span>;
				case 'link':
					if (current.attrs) {
						return <a href={current.attrs.href} title={current.attrs.title} key={index} target={'_top'}>{previous}</a>;
					}
					return previous;
				default:
					return previous;
				}
			}, <span style={style}>{node.text}</span>);
		}
	},

	/*
	image: {
		inline: true,
		attrs: {
			src: {},
			alt: { default: null },
			title: { default: nul l}
		},
		group: 'inline',
		draggable: true,
		parseDOM: [{tag: 'img[src]', getAttrs(dom) {
			return {
				src: dom.getAttribute('src'),
				title: dom.getAttribute('title'),
				alt: dom.getAttribute('alt')
			}
		}}],
		toDOM(node) { return ['img', node.attrs]; }
	},
	*/

	hard_break: {
		inline: true,
		group: 'inline',
		selectable: false,
		parseDOM: [{ tag: 'br' }],
		toDOM() { return ['br']; },
		// toReact({ node, index }) {
		// 	return <br key={index} />;
		// }
	},

	// empty schema block
	none: {
		group: 'block',
		toDOM() { return ['span']; }
	},

	// page_break: {
	// 	group: 'block',
	// 	toDOM(node) { return ['div', { class: 'pagebreak' }, 'pagebreak']; },
	// 	toReact({ node, index }) {
	// 		return <div className={'pagebreak'} key={index}></div>;
	// 	}
	// },

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
			title: { default: null }
		},
		parseDOM: [
			{
				tag: 'a[href]',
				getAttrs(dom) {
					return { href: dom.getAttribute('href'), title: dom.getAttribute('title') };
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
