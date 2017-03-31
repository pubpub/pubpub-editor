'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _richEditor = require('./editors/richEditor');

Object.defineProperty(exports, 'RichEditor', {
  enumerable: true,
  get: function get() {
    return _richEditor.RichEditor;
  }
});

var _collaborativeEditor = require('./editors/collaborativeEditor');

Object.defineProperty(exports, 'CollaborativeEditor', {
  enumerable: true,
  get: function get() {
    return _collaborativeEditor.CollaborativeEditor;
  }
});

var _schema = require('./schema');

Object.defineProperty(exports, 'schema', {
  enumerable: true,
  get: function get() {
    return _schema.schema;
  }
});

var _buildMenu = require('./menu-config/buildMenu');

Object.defineProperty(exports, 'buildMenuItems', {
  enumerable: true,
  get: function get() {
    return _buildMenu.buildMenuItems;
  }
});