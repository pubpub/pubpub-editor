# ppub-pandoc-convert

## A converter from PubPub to Pandoc

You can either `require('@pubpub/pubpub-pandoc-converter').pandocToPpub` OR `.pandocToPpub`.

# pandocToPpub(file, options)

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

A reverse converter (Pandoc to PubPub) is being created as well.

These are the only parts that have been completed so far:

- Header
- Paragraph
- Code
- Strong, Italic, Substring, Superscript, Strikethrough
