const {Schema} = require("prosemirror-model")

const nodes = {

  doc: {
    content: "article citations",
    attrs: {
      meta: {default: {}},
    }
  },

  article: {
    content: "block+",
    parseDOM: [{tag: "div.article"}],
    toDOM(node) { return ["div", { class: 'article'}, 0]}
  },

  paragraph: {
    content: "inline<_>*",
    group: "block",
    parseDOM: [{tag: "p"}],
    toDOM() { return ["p", 0] }
  },

  highlight: {
    group: 'inline',
    content: "text*",
    inline: true,
  },


  mention: {
    atom: true,
    group: 'inline',
    attrs: {
      text: {default: ''},
      meta: {default: {}},
  		type: {default: ''}
  	},
    inline: true,
  },

  equation: {
    atom: true,
    group: 'inline',
    content: "inline<_>*",
    attrs: {
      content: {default: ''},
    },
    inline: true,
  },

   block_equation: {
    atom: true,
    group: 'block',
    content: "inline<_>*",
    attrs: {
      content: {default: ''},
    },
  },


  citations: {
    atom: true,
    content: "citation*",
    group: "footer",
    parseDOM: [{tag: "hr.citations"}],
    selectable: false,
    toDOM() { return ["div", ["hr"]] }
  },

  citation: {
    attrs: {
      data: {default: {}},
      citationID: {default: null},
    },
    group: "footer",
    selectable: false,
    toDOM() { return ["div"] }
  },

  reference: {
    atom: true,
    inline: true,
    attrs: {
      citationID: {default: null},
      referenceID: {default: null},
    },
    group: "inline",

  },

  iframe: {
    attrs: {
      url: {default: null},
      height: {default: null},
      width: {default: null},
    },
    group: 'block',
  },

  embed: {
    atom: true,
    content: "caption?",
    attrs: {
      filename: {default: ''},
  		url: {default: ''},
  		figureName: {default: ''},
      size: {default: ''},
      align: {default: ''},
  	},
  	inline: false,
  	group: 'block',
  	draggable: false,
    selectable: true
  },

  caption: {
    content: "inline<_>*",
    group: "block",
    parseDOM: [{tag: "p"}],
    toDOM() { return ["p", 0] }
  },

  aside: {
    content: "inline<_>*",
    group: "block",
    parseDOM: [{tag: "aside"}],
    toDOM() { return ["aside"] }
  },

  blockquote: {
    content: "block+",
    group: "block",
    parseDOM: [{tag: "blockquote"}],
    toDOM() { return ["blockquote", 0] }
  },

  horizontal_rule: {
    group: "block",
    parseDOM: [{tag: "hr"}],
    toDOM() { return ["div", ["hr"]] }
  },

  heading: {
    attrs: {level: {default: 1}},
    content: "inline<_>*",
    group: "block",
    parseDOM: [{tag: "h1", attrs: {level: 1}},
               {tag: "h2", attrs: {level: 2}},
               {tag: "h3", attrs: {level: 3}},
               {tag: "h4", attrs: {level: 4}},
               {tag: "h5", attrs: {level: 5}},
               {tag: "h6", attrs: {level: 6}}],
    toDOM(node) { return ["h" + node.attrs.level, 0] }
  },

  code_block: {
    content: "text*",
    group: "block",
    code: true,
    parseDOM: [{tag: "pre", preserveWhitespace: true}],
    toDOM() { return ["pre", ["code", 0]] }
  },


  text: {
    group: "inline",
    toDOM(node) { return node.text }
  },

  image: {
    inline: true,
    attrs: {
      src: {},
      alt: {default: null},
      title: {default: null}
    },
    group: "inline",
    draggable: true,
    parseDOM: [{tag: "img[src]", getAttrs(dom) {
      return {
        src: dom.getAttribute("src"),
        title: dom.getAttribute("title"),
        alt: dom.getAttribute("alt")
      }
    }}],
    toDOM(node) { return ["img", node.attrs] }
  },

  hard_break: {
    inline: true,
    group: "inline",
    selectable: false,
    parseDOM: [{tag: "br"}],
    toDOM() { return ["br"] }
  }
}
exports.nodes = nodes

const marks = {
  em: {
    parseDOM: [{tag: "i"}, {tag: "em"},
               {style: "font-style", getAttrs: value => value == "italic" && null}],
    toDOM() { return ["em"] }
  },

  strong: {
    parseDOM: [{tag: "strong"},
               // This works around a Google Docs misbehavior where
               // pasted content will be inexplicably wrapped in `<b>`
               // tags with a font-weight normal.
               {tag: "b", getAttrs: node => node.style.fontWeight != "normal" && null},
               {style: "font-weight", getAttrs: value => /^(bold(er)?|[5-9]\d{2,})$/.test(value) && null}],
    toDOM() { return ["strong"] }
  },

  link: {
    attrs: {
      href: {default: ''},
      title: {default: null}
    },
    parseDOM: [{tag: "a[href]", getAttrs(dom) {
      return {href: dom.getAttribute("href"), title: dom.getAttribute("title")}
    }}],
    toDOM(node) { return ["a", node.attrs] }
  },

  code: {
    parseDOM: [{tag: "code"}],
    toDOM() { return ["code"] }
  }
}
exports.marks = marks

const schema = new Schema({nodes, marks, topNode: "doc"})
exports.schema = schema
