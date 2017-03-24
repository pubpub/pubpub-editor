# pubpub-packages
NPM packages released by the pubpub org.

Other PubPub repos can be found here:
- PubPub Core: https://github.com/pubpub/pubpub
- PubPub Editor: https://github.com/pubpub/pubpub-editor

The following packages are found in thise repo:

## PubPub Prose

The core of the pubpub editing experience, built on top of prosemirror: https://github.com/ProseMirror/prosemirror. This repo defines the ppub JSON format for documents (built on top of prosemirror's docJSON format), as well as plugins, menus and editors.

### How to test and develop
- To build run `npm run watch`
- To test the react components run `npm run storybook`

## PubPub Render Files

Used for rendering files on PubPub, includes support for markdown files and ppub flavored documents.

### How to test and develop
- To build and watch run `npm run watch`
