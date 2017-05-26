'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _biblatexCslConverter = require('biblatex-csl-converter');

var parseBibTeX = function parseBibTeX(bibString) {
    var parser = new _biblatexCslConverter.BibLatexParser(bibString, {
        processUnexpected: true,
        processUnknown: {
            collaborator: 'l_name'
        }
    });
    var bibDB = parser.output;
    if (parser.errors.length) {
        console.log(parser.errors);
        return null;
    }
    var exporter = new _biblatexCslConverter.CSLExporter(bibDB);
    return Object.values(exporter.output);
};

exports.default = parseBibTeX;