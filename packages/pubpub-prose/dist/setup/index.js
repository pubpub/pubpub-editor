'use strict';

var _setup = require('./setup');

var _clipboardSerializer = require('./clipboardSerializer');

var _schema = require('./schema');

exports.pubpubSetup = _setup.pubpubSetup;
exports.buildMenuItems = _setup.buildMenuItems;
exports.buildKeymap = _setup.buildKeymap;
exports.clipboardParser = _clipboardSerializer.clipboardParser;
exports.clipboardSerializer = _clipboardSerializer.clipboardSerializer;
exports.migrateDiffs = _schema.migrateDiffs;
exports.migrateMarks = _schema.migrateMarks;
exports.schema = _schema.schema;