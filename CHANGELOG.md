# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [5.1.1] - 2018-11-12
- update: headerIds module trims after replacing non alphanumeric characters to avoid leading or trailing hyphens.

## [5.1.0] - 2018-11-08
- feature: Highlight quote now takes a `generateActionElement` function in options that can be used to create an element for scrolling, highlighting, or other highlight actions.
- update: **Breaking** HighlightQuote no longer provides scroller or highlight functionality.
- update: Add download attribute to File component links.
- fix: Highlight plugin properly checks doc nodeSize.
- fix: Highlight plugin properly handles textQuote errors.

## [5.0.4] - 2018-10-29
- fix: Parse more variants of strikethrough dom nodes.

## [5.0.3] - 2018-10-29
- fix: importHtml more properly inserts Slice rather than looping through nodes.

## [5.0.2] - 2018-10-21
- fix: Properly referencing new prosemirror-compress-pubpub package.

## [5.0.1] - 2018-10-21
- fix: Use new prosemirror-compress package that solves Safari Object prototype bug.

## [5.0.0] - 2018-10-16
- update: Breaking - rebuilt architecture that simplifies and cleans use of the PubPub editor. The editor is no longer responsible for interfaces to nodeviews and menus. The data necessary to build such menus are passed up in the onChange response.

## [4.11.0] - 2018-06-20
- feature: Add importHtml function to <Editor />.

## [4.10.0] - 2018-06-20
- update: Prosemirror and react dependencies.

## [4.9.1] - 2018-06-08
- feature: Allow images to link to their src.

## [4.9.0] - 2018-05-26
- fix: Change chapter to section for more general naming.

## [4.8.3] - 2018-05-25
- fix: Apply highlights in batches for better performance.

## [4.8.2] - 2018-05-09
- fix: Trim header Id to remove trailing spaces.

## [4.8.1] - 2018-05-04
- fix: Attempting to fix firebase dependency bug.

## [4.8.0] - 2018-05-04
- feature: Add handlePermalink prop for HighlightQuote.

## [4.7.0] - 2018-05-04
- feature: Add chapter support in highlights.

## [4.6.1] - 2018-04-19
- fix: Clean up spans produced when rendering staticMarkup.

## [4.6.0] - 2018-04-19
- feature: Add renderStaticMarkup prop on <Editor /> so that you can server-render clean markup.

## [4.5.2] - 2018-03-30
- fix: Don't catch getJSONs error - let is pass up the promise chain.

## [4.5.1] - 2018-03-24
- feature: Add getText function.

## [4.5.0] - 2018-03-23
- feature: Add getCollabJSONs function to <Editor /> which builds the JSONS at a array of paths.

## [4.4.7] - 2018-03-11
- fix: Bug fix for Editors with no children components

## [4.4.6] - 2018-03-11
- fix: Only trigger onChange on Editor component if the doc changes - rather than on every transaction.

## [4.4.5] - 2018-02-26
- fix: Highlight version bug fix.

## [4.4.4] - 2018-02-24
- fix: Handle transaction disconnect error with .catch

## [4.4.3] - 2018-02-24
- fix: Better handling of resending pending changes when a transaction fails to commit.

## [4.4.2] - 2018-02-23
- fix: Fix dom anchor selection

## [4.4.1] - 2018-02-23
- fix: Fix handling of chrome-bug-workaround in options-wrapper

## [4.4.0] - 2018-02-23
- feature: support for collaborative firebase authentication added.

## [4.3.0] - 2018-02-23
- fix: Collaborative editor rewritten to be much more stable.
- fix: Load collaborative doc all at once if there is a checkpoint, rather than by piece.
- feature: collaborative docs now show loading bars until remote doc is loaded.
- feature: cursors are now inline rather than circles on the side

## [4.2.12] - 2018-02-07
- CSS scope header bug fix

## [4.2.11] - 2018-02-07
- Aligning headerLinks to top of header

## [4.2.10] - 2018-02-07
- Add support for showHeaderLinks
- Make headers 'defining'

## [4.2.9] - 2018-02-07
- Headers are now assigned ids equal to their content

## [4.2.8] - 2018-02-05
- Latex middle alignment fix

## [4.2.7] - 2018-02-03
- Footnote CSS alignment fix for Firefox.

## [4.2.6] - 2018-01-25
- Change permalink copy button text.

## [4.2.5] - 2018-01-16
- Formatting menu no longer maxes out at top = 0. Fixes overlap on first line.
- HighlightMenu button overlap fix.
- HighlightMenu button uses CopyToClipboard and direct NewDiscussion buttons.

## [4.2.4] - 2018-01-16
- Bug fix for database healing

## [4.2.3] - 2018-01-03
- Quick bug fix for Citation List SSR. Needs more work for proper SSR rendering

## [4.2.2] - 2018-01-03
- Bug fix for server render of empty paragraphs.
- Fix static render functions to never insert div inside p. It ruins SSR

## [4.2.1] - 2018-01-01
- Add support for editorId prop on <Editor>. Important for SSR and client HTML matching.

## [4.2.0] - 2018-01-01
- Add support for Server-Side Rendering. Documents will render first as React Tree, and then in the Browser be replaced by the ProseMirror instance of the document. Requires all schema types to have a toStatic() function which returns a React component.

## [4.1.4] - 2017-12-21
- Add `class` attribute to paragraph in baseSchema

## [4.1.3] - 2017-12-21
- Add `target` attribute to link in baseSchema

## [4.1.2] - 2017-12-08
- Fix whitespace issues for citations and citation lists
- Fix latex text-align issue

## [4.1.1] - 2017-12-03
- Fixed bug where highlights passed to HighlightMenu wouldn't render until componentWillReceiveProps was triggered. That is - they wouldn't render on first load even if they were available.

## [4.1.0] - 2017-11-10
- Added optional prop `onStatusChange` to the `<Collaborative />`. onStatusChange is a function that will be called when the collaboration status is changed. Possible values are 'connected', 'saving', 'saved', and 'disconnected'.

## [4.0.0] - 2017-11-10
- Moving the editor out of beta versioning.
- Addons documented
- README updated to include details on writing new Addons