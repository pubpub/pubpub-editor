# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]

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