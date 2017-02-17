'use strict';

var _bibtextocsl = require('./bibtextocsl');

var _bibtextocsl2 = _interopRequireDefault(_bibtextocsl);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var generateBibTexString = function generateBibTexString(jsonInfo) {
	var fields = ['title', 'author', 'journal', 'volume', 'number', 'pages', 'year'];
	var map = {
		'journal_title': 'journal',
		'author_instituion': 'institution'
	};
	var jsonKeys = Object.keys(jsonInfo);
	return '\n\t\t@article{bibgen,\n\t\t\t' + jsonKeys.map(function (key) {
		if (jsonInfo[key]) {
			return key + '={' + jsonInfo[key] + '}';
		}
		return null;
	}).filter(function (value) {
		return !!value;
	}).join(',') + '\n\t\t}\n\t';
};

var convertJSONtoCSL = function convertJSONtoCSL(json) {
	var bibTexString = generateBibTexString(json);
	var cslJSON = (0, _bibtextocsl2.default)(bibTexString);
	return cslJSON;
};

exports.convertJSONtoCSL = convertJSONtoCSL;
exports.generateBibTexString = generateBibTexString;