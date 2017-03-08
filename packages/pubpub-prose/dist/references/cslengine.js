'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _csldata = require('./csldata');

var _citeproc = require('../citeproc/citeproc');

var _bibtextocsl = require('./bibtextocsl');

var _bibtextocsl2 = _interopRequireDefault(_bibtextocsl);

var _striptags = require('striptags');

var _striptags2 = _interopRequireDefault(_striptags);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var CitationEngine = function () {
  function CitationEngine() {
    var _this = this;

    _classCallCheck(this, CitationEngine);

    this.setBibliography = function (refItems) {
      var citeproc = new _citeproc.CSL.Engine(_this.sys, _csldata.styles[_this.style]);
      var itemIDs = refItems.map(function (item) {
        return item.id;
      });
      var items = {};
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = refItems[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var item = _step.value;

          items[item.id] = item;
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      _this.items = items;
      _this.itemIDs = itemIDs;
      citeproc.updateItems(itemIDs, true);
      _this.citeproc = citeproc;
    };

    this.removeCitation = function (citationID) {
      _this.items = _this.items.filter(function (item) {
        return item.id !== citationID;
      });
      _this.itemIDs = _this.itemIDs.filter(function (itemID) {
        return itemID !== citationID;
      });
      citeproc.updateItems(itemIDs, true);
    };

    this.getAllReferences = function () {
      return _this.items;
    };

    this.getShortForm = function (citationID) {

      if (!_this.items[citationID]) {
        return null;
      }

      try {

        var citation_object = {
          // items that are in a citation that we want to add. in this case,
          // there is only one citation object, and we know where it is in
          // advance.
          "citationItems": [{
            "id": citationID
          }],
          "properties": {
            "noteIndex": 0
          }

        };

        var citation = _this.items[citationID];
        var cluster = _this.citeproc.appendCitationCluster(citation_object, true);
        if (cluster && cluster.length > 0) {
          return cluster[0][1];
        }
        return null;
      } catch (err) {
        return null;
      }
    };

    this.addCitation = function (citation) {
      _this.items[citation.id] = citation;
      _this.itemIDs.push(citation.id);
      _this.citeproc.updateItems(_this.itemIDs, true);
    };

    this.getBibliography = function (itemIDs) {
      if (!_this.citeproc) {
        return null;
      }
      if (itemIDs) {
        _this.citeproc.updateItems(itemIDs, true);
      }
      if (_this.citeproc.bibliography.tokens.length) {
        var bibRes = _this.citeproc.makeBibliography();
        if (bibRes && bibRes.length > 1) {
          var _ret = function () {
            var entries = bibRes[0].entry_ids.map(function (entry) {
              return entry[0];
            });
            var bibArray = bibRes[1];
            var extractRegex = /\s*\<div[^>]*\>(.*)\<\/div.*\>\s*/;
            var bib = bibArray.map(function (bibEntry, index) {
              if (bibEntry) {
                return { text: (0, _striptags2.default)(bibEntry), id: entries[index] };
              }
              return null;
            });
            return {
              v: bib
            };
          }();

          if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
        }
        return null;
      }
      return null;
    };

    this.citeproc = null;
    this.items = {};
    this.itemIDs = [];

    this.style = 'acm';

    this.sys = {
      retrieveItem: function retrieveItem(itemID) {
        console.log('GETTING ITEM', itemID);
        return _this.items[itemID];
      },
      retrieveLocale: function retrieveLocale(locale) {
        var result = _csldata.locales[locale];
        return result;
      }
    };

    this.setBibliography = this.setBibliography.bind(this);
    this.getShortForm = this.getShortForm.bind(this);
    this.getSingleBibliography = this.getSingleBibliography.bind(this);
  }

  _createClass(CitationEngine, [{
    key: 'getSingleBibliography',
    value: function getSingleBibliography(itemID) {
      if (!this.items[itemID]) {
        console.log('Could not find in dict');
        return null;
      }
      // console.log(this.citeproc);
      // this.citeproc.updateItems(this.itemIDs, true);
      var query = {
        "include": [{
          "field": "id",
          "value": itemID
        }]
      };
      var result = this.citeproc.makeBibliography(query);

      console.log('Found result!', result, this.items[itemID], query);

      if (result && result.length >= 1 && result[1].length > 0) {
        return result[1][0];
      }
      return null;
    }
  }]);

  return CitationEngine;
}();

exports.default = CitationEngine;