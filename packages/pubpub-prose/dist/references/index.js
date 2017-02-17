'use strict';

var _citationConversion = require('./citationConversion');

var _cslengine = require('./cslengine');

var _cslengine2 = _interopRequireDefault(_cslengine);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.convertJSONtoCSL = _citationConversion.convertJSONtoCSL;
exports.generateBibTexString = _citationConversion.generateBibTexString;
exports.CitationEngine = _cslengine2.default;