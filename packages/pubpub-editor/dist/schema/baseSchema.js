'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

// import { CitationEngine } from '../references';


var _components = require('./render/components');

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectDestructuringEmpty(obj) { if (obj == null) throw new TypeError("Cannot destructure undefined"); }

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

var nodes = {

	doc: {
		content: 'block+',
		attrs: {
			meta: { default: {} }
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
		content: 'inline<_>*',
		group: 'block',
		parseDOM: [{ tag: 'p' }],
		toDOM: function toDOM() {
			return ['p', 0];
		},
		toReact: function toReact(_ref) {
			var node = _ref.node,
			    renderContent = _ref.renderContent,
			    meta = _ref.meta,
			    index = _ref.index;

			return _react2.default.createElement(
				'div',
				{ className: 'p-block', key: index },
				renderContent(node.content, meta)
			);
		}
	},

	highlight: {
		group: 'inline',
		inline: true,
		attrs: {
			highlightID: { default: null }
		},
		toDOM: function toDOM() {
			return ['div', 0];
		}
	},

	mention: {
		content: 'inline<_>*',
		atom: true,
		group: 'inline',
		attrs: {
			url: { default: '' },
			type: { default: ' ' }
		},
		inline: true,
		toReact: function toReact(_ref2) {
			var node = _ref2.node,
			    renderContent = _ref2.renderContent,
			    meta = _ref2.meta,
			    index = _ref2.index;

			var mentionURL = node.attrs.url;
			if (meta.fileMap[mentionURL]) {
				mentionURL = '/pub/' + meta.slug + '/files/' + mentionURL;
			}
			return _react2.default.createElement(
				_components.MentionRender,
				{ key: index, type: node.attrs.type, url: mentionURL },
				renderContent(node.content, meta)
			);
		}
	},

	equation: {
		atom: true,
		group: 'inline',
		content: 'inline<_>*',
		attrs: {
			content: { default: '' }
		},
		inline: true,
		toReact: function toReact(_ref3) {
			var node = _ref3.node,
			    index = _ref3.index;

			var equationText = void 0;
			if (node.content && node.content.length >= 1) {
				equationText = node.content[0].text;
			} else if (node.attrs.content) {
				equationText = node.attrs.content;
			}
			return _react2.default.createElement(_components.LatexRender, { key: index, value: equationText, block: false });
		}
	},

	block_equation: {
		atom: true,
		group: 'block',
		content: 'inline<_>*',
		attrs: {
			content: { default: '' }
		},
		toReact: function toReact(_ref4) {
			var node = _ref4.node,
			    index = _ref4.index;

			var equationText = void 0;
			if (node.content && node.content.length >= 1) {
				equationText = node.content[0].text;
			} else if (node.attrs.content) {
				equationText = node.attrs.content;
			}
			return _react2.default.createElement(_components.LatexRender, { key: index, value: equationText, block: true });
		}
	},

	citations: {
		atom: true,
		content: 'citation*',
		group: 'block',
		parseDOM: [{ tag: 'hr.citations' }],
		selectable: false,
		toDOM: function toDOM() {
			return ['div', ['hr']];
		},
		toReact: function toReact(_ref5) {
			var node = _ref5.node,
			    index = _ref5.index,
			    meta = _ref5.meta;

			var bib = void 0;
			if (meta.docAttrs && meta.docAttrs.bib) {
				bib = meta.docAttrs.bib;
			}
			return _react2.default.createElement(_components.CitationsRender, _extends({ key: index, renderedBib: bib }, node.attrs, { citations: node.content }));
		}
	},

	citation: {
		attrs: {
			data: { default: {} },
			citationID: { default: null }
		},
		group: 'footer',
		selectable: false,
		toDOM: function toDOM() {
			return ['div'];
		},
		toReact: function toReact(_ref6) {
			var node = _ref6.node,
			    index = _ref6.index,
			    meta = _ref6.meta;

			var bib = void 0;
			if (meta.docAttrs && meta.docAttrs.bib) {
				bib = meta.docAttrs.bib;
			}
			return _react2.default.createElement(_components.CitationsRender, _extends({ key: index, renderedBib: bib }, node.attrs, { citations: node.content }));
		}
	},

	reference: {
		atom: true,
		inline: true,
		attrs: {
			citationID: { default: null },
			referenceID: { default: null }
		},
		group: 'inline',
		toReact: function toReact(_ref7) {
			var node = _ref7.node,
			    index = _ref7.index;

			var citationID = node.attrs.citationID;
			var label = void 0;
			if (meta.docAttrs && meta.docAttrs.inlineBib) {
				label = meta.docAttrs.inlineBib[citationID];
			}
			return _react2.default.createElement(_components.ReferenceRender, _extends({ citationID: citationID, key: index, label: label }, node.attrs));
		}
	},

	iframe: {
		attrs: {
			url: { default: null },
			height: { default: null },
			width: { default: null }
		},
		group: 'block',
		toReact: function toReact(_ref8) {
			var node = _ref8.node,
			    index = _ref8.index;

			return _react2.default.createElement(_components.IframeRender, _extends({ key: index }, node.attrs));
		}
	},

	embed: {
		atom: true,
		content: 'caption?',
		attrs: {
			filename: { default: '' },
			url: { default: '' },
			figureName: { default: '' },
			size: { default: '' },
			align: { default: '' }
		},
		parseDOM: [{ tag: 'img[src]' }],
		inline: false,
		group: 'block',
		draggable: false,
		selectable: true,
		toReact: function toReact(_ref9) {
			var node = _ref9.node,
			    index = _ref9.index,
			    renderContent = _ref9.renderContent;

			var filename = node.attrs.filename;
			var url = meta.fileMap[filename];
			return _react2.default.createElement(
				_components.EmbedRender,
				_extends({ key: index }, node.attrs, { url: url }),
				renderContent(node.content, meta)
			);
		},
		toEditable: function toEditable(_ref10) {
			_objectDestructuringEmpty(_ref10);

			return _react2.default.createElement(EmbedView, null);
		}
	},

	caption: {
		content: 'inline<_>*',
		group: 'block',
		parseDOM: [{ tag: 'p' }],
		toDOM: function toDOM() {
			return ['p', 0];
		}
	},

	// removable, but think some legacy docs may use this
	aside: {
		content: 'inline<_>*',
		group: 'block',
		parseDOM: [{ tag: 'aside' }],
		toDOM: function toDOM() {
			return ['aside'];
		}
	},

	footnote: {
		atom: true,
		inline: true,
		attrs: {
			content: { default: '' }
		},
		group: 'inline',
		parseDOM: [{ tag: 'aside' }],
		toDOM: function toDOM() {
			return ['aside'];
		},
		toReact: function toReact(_ref11) {
			var node = _ref11.node,
			    index = _ref11.index,
			    renderContent = _ref11.renderContent,
			    meta = _ref11.meta;

			if (!meta.footnoteCount) {
				meta.footnoteCount = 0;
			}
			meta.footnoteCount = meta.footnoteCount + 1;
			return _react2.default.createElement(_components.FootnoteRender, { content: node.attrs.content, label: meta.footnoteCount });
		}
	},

	blockquote: {
		content: 'block+',
		group: 'block',
		parseDOM: [{ tag: 'blockquote' }],
		toDOM: function toDOM() {
			return ['blockquote', 0];
		},
		toReact: function toReact(_ref12) {
			var node = _ref12.node,
			    index = _ref12.index,
			    renderContent = _ref12.renderContent;

			return _react2.default.createElement(
				'blockquote',
				{ key: index },
				renderContent(node.content, meta)
			);
		}
	},

	horizontal_rule: {
		group: 'block',
		parseDOM: [{ tag: 'hr' }],
		toDOM: function toDOM() {
			return ['div', ['hr']];
		},
		toReact: function toReact(_ref13) {
			var node = _ref13.node,
			    index = _ref13.index,
			    renderContent = _ref13.renderContent;

			return _react2.default.createElement('hr', { key: index });
		}
	},

	heading: {
		attrs: { level: { default: 1 } },
		content: 'inline<_>*',
		group: 'block',
		parseDOM: [{ tag: 'h1', attrs: { level: 1 } }, { tag: 'h2', attrs: { level: 2 } }, { tag: 'h3', attrs: { level: 3 } }, { tag: 'h4', attrs: { level: 4 } }, { tag: 'h5', attrs: { level: 5 } }, { tag: 'h6', attrs: { level: 6 } }],
		toDOM: function toDOM(node) {
			return ['h' + node.attrs.level, 0];
		},
		toReact: function toReact(_ref14) {
			var node = _ref14.node,
			    index = _ref14.index,
			    renderContent = _ref14.renderContent;

			if (!node.content) {
				return null;
			}
			var id = node.content[0] && node.content[0].text && node.content[0].text.trim().replace(/[^A-Za-z0-9 ]/g, '').replace(/\s/g, '-').toLowerCase();
			return _react2.default.createElement('h' + node.attrs.level, { key: index, id: id }, renderContent(node.content, meta));
		}
	},

	code_block: {
		content: 'text*',
		group: 'block',
		code: true,
		parseDOM: [{ tag: 'pre', preserveWhitespace: true }],
		toDOM: function toDOM() {
			return ['pre', ['code', 0]];
		},
		toReact: function toReact(_ref15) {
			var node = _ref15.node,
			    index = _ref15.index,
			    renderContent = _ref15.renderContent;

			return _react2.default.createElement(
				'pre',
				{ key: index },
				_react2.default.createElement(
					'code',
					null,
					renderContent(node.content, meta)
				)
			);
		}
	},

	html_block: {
		atom: true,
		attrs: {
			content: { default: '' }
		},
		parseDOM: [{ tag: 'div.customHTML' }],
		inline: false,
		group: 'block',
		draggable: false,
		selectable: true,
		toReact: function toReact(_ref16) {
			var node = _ref16.node,
			    index = _ref16.index;

			return _react2.default.createElement(_components.HtmlRender, _extends({ key: index }, node.attrs));
		}
	},

	text: {
		group: 'inline',
		toDOM: function toDOM(node) {
			return node.text;
		},
		toReact: function toReact(_ref17) {
			var node = _ref17.node,
			    index = _ref17.index;

			var marks = node.marks || [];
			var style = {};
			return marks.reduce(function (previous, current) {
				switch (current.type) {
					case 'strong':
						return _react2.default.createElement(
							'strong',
							{ key: index },
							previous
						);
					case 'em':
						return _react2.default.createElement(
							'em',
							{ key: index },
							previous
						);
					case 'code':
						return _react2.default.createElement(
							'code',
							{ key: index },
							previous
						);
					case 'sub':
						return _react2.default.createElement(
							'sub',
							{ key: index },
							previous
						);
					case 'sup':
						return _react2.default.createElement(
							'sup',
							{ key: index },
							previous
						);
					case 's':
					case 'strike':
						return _react2.default.createElement(
							's',
							{ key: index },
							previous
						);
					case 'diff_plus':
						return _react2.default.createElement(
							'span',
							{ 'data-commit': current.attrs.commitID, className: 'diff-marker added' },
							previous
						);
					case 'diff_minus':
						return _react2.default.createElement(
							'span',
							{ 'data-commit': current.attrs.commitID, className: 'diff-marker removed' },
							previous
						);
					case 'link':
						if (current.attrs) {
							return _react2.default.createElement(
								'a',
								{ href: current.attrs.href, title: current.attrs.title, key: index, target: '_top' },
								previous
							);
						}
						return previous;
					default:
						return previous;
				}
			}, _react2.default.createElement(
				'span',
				{ style: style },
				node.text
			));
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
		toDOM: function toDOM() {
			return ['br'];
		},
		toReact: function toReact(_ref18) {
			var node = _ref18.node,
			    index = _ref18.index;

			return _react2.default.createElement('br', { key: index });
		}
	},

	// empty schema block
	none: {
		group: 'block',
		toDOM: function toDOM() {
			return ['span'];
		}
	},

	page_break: {
		group: 'block',
		toDOM: function toDOM(node) {
			return ['div', { class: 'pagebreak' }, 'pagebreak'];
		},
		toReact: function toReact(_ref19) {
			var node = _ref19.node,
			    index = _ref19.index;

			return _react2.default.createElement('div', { className: 'pagebreak', key: index });
		}
	},

	emoji: {
		group: 'inline',
		attrs: {
			content: { default: '' },
			markup: { default: '' }
		},
		toDOM: function toDOM(node) {
			return ['span', node.attrs.content];
		},
		inline: true,
		toReact: function toReact(_ref20) {
			var node = _ref20.node,
			    index = _ref20.index;

			return _react2.default.createElement(
				'span',
				{ key: index },
				node.attrs.content
			);
		}
	}

};

var marks = {
	em: {
		parseDOM: [{ tag: 'i' }, { tag: 'em' }, {
			style: 'font-style',
			getAttrs: function getAttrs(value) {
				return value === 'italic' && null;
			}
		}],
		toDOM: function toDOM() {
			return ['em'];
		}
	},

	strong: {
		parseDOM: [{ tag: 'strong' },
		// This works around a Google Docs misbehavior where
		// pasted content will be inexplicably wrapped in `<b>`
		// tags with a font-weight normal.
		{ tag: 'b', getAttrs: function getAttrs(node) {
				return node.style.fontWeight !== 'normal' && null;
			} }, { style: 'font-weight', getAttrs: function getAttrs(value) {
				return (/^(bold(er)?|[5-9]\d{2,})$/.test(value) && null
				);
			} }],
		toDOM: function toDOM() {
			return ['strong'];
		}
	},
	diff_plus: {
		attrs: {
			commitID: { default: null }
		},
		parseDOM: [],
		toDOM: function toDOM(node) {
			return ['span', { class: 'diff-marker added', "data-commit": node.attrs.commitID }, 0];
		},

		excludes: "diff_minus"
	},
	diff_minus: {
		attrs: {
			commitID: { default: null }
		},
		parseDOM: [],
		toDOM: function toDOM(node) {
			return ['span', { class: 'diff-marker removed', "data-commit": node.attrs.commitID }, 0];
		},

		excludes: "diff_plus"
	},
	link: {
		attrs: {
			href: { default: '' },
			title: { default: null }
		},
		parseDOM: [{
			tag: 'a[href]',
			getAttrs: function getAttrs(dom) {
				return { href: dom.getAttribute('href'), title: dom.getAttribute('title') };
			}
		}],
		toDOM: function toDOM(node) {
			return ['a', node.attrs];
		}
	},
	sub: {
		parseDOM: [{ tag: 'sub' }],
		toDOM: function toDOM() {
			return ['sub'];
		}
	},
	sup: {
		parseDOM: [{ tag: 'sup' }],
		toDOM: function toDOM() {
			return ['sup'];
		}
	},
	strike: {
		parseDOM: [{ tag: 's' }],
		toDOM: function toDOM() {
			return ['s'];
		}
	},
	code: {
		parseDOM: [{ tag: 'code' }],
		toDOM: function toDOM() {
			return ['code'];
		}
	}
};

exports.marks = marks;
exports.nodes = nodes;