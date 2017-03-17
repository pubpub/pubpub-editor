# ppub-pandoc-convert

## A converter between ppub and pandoc

You can either `require('./index').pandocToPpub` OR `.pandocToPpub` or run on the command line like `node index.js [--toPandoc OR --toPpub] [filename].json`

# pandocToPpub

### Progress

The pandocToPpub converter is complete.

## Currently supported metadata

- author
- title

The below metadata work for the MIT Thesis Template:

- university
- degree
- date
- supervisor-name
- supervisor-title
- department-chairman-name
- department-chairman-title
- acknowledgements
- abstract
- degree-month
- degree-year
- thesis-date
- department

# ppubToPandoc

### Progress

These are the only parts that have been completed so far:

- Header
- Paragraph
- Code
- Strong, Italic, Substring, Superscript, Strikethrough
