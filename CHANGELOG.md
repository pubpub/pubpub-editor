# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]

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