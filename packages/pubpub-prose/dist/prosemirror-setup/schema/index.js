'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _buildSchema = require('./buildSchema');

Object.defineProperty(exports, 'schema', {
  enumerable: true,
  get: function get() {
    return _buildSchema.schema;
  }
});
Object.defineProperty(exports, 'createSchema', {
  enumerable: true,
  get: function get() {
    return _buildSchema.createSchema;
  }
});