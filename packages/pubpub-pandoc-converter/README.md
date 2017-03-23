# ppub-pandoc-convert

A converter from PubPub (ProseMirror) to Pandoc.

#### Table of Contents

1. [Installation](#install)
2. [Usage](#usage)
	1. [Converting to Pandoc](#pandoc-convert)
		1. [Supported Metadata](#metadata)
	2. [Converting to Ppub](#ppub-convert)
3. [Testing](#test)



<a id='install'></a>
## Installation
`npm install @pubpub/pubpub-pandoc-converter`

`var ppubToPandoc = require('@pubpub/pubpub-pandoc-converter').ppubToPandoc`.

<a id='usage'></a>

## Usage


<a id='pandoc-convert'></a>
### Converting to Pandoc

`ppubToPandoc(file, options)`

`options.bibFile` (what the bib file will be saved as)

`options.metadata` all the metadata stored in the converted pandoc file. Possible keys are listed below.


<a id='metadata'></a>
#### Supported Metadata

```
authors (an array of strings)
title
institute
degree
date
supervisor-name
supervisor-title
department-chairman-name
department-chairman-title
acknowledgements
abstract
degree-month
degree-year
thesis-date
department
pub-readers (an array of JSON objects with strings name, title, and affiliation)
```

<a id='ppub-convert'></a>
### Converting to Ppub

Converting to Ppub from Pandoc is a work in progress.

<a id='test'></a>
## Testing

cd into this package directory and run

`npm run test`
