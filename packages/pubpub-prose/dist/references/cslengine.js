'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _csldata = require('./csldata');

var _citeproc = require('./citeproc');

var _bibtextocsl = require('./bibtextocsl');

var _bibtextocsl2 = _interopRequireDefault(_bibtextocsl);

var _striptags = require('striptags');

var _striptags2 = _interopRequireDefault(_striptags);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

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
      itemIDs = [].concat(_toConsumableArray(new Set(itemIDs)));
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

    this.buildState = function (citations) {
      var buildCitation = function buildCitation(citationID, index) {
        return {
          "citationID": citationID,
          "citationItems": [{
            "id": citationID
          }],
          "properties": {
            "noteIndex": index
          }
        };
      };
      var citationObjects = citations.map(buildCitation);
      var bib = _this.citeproc.rebuildProcessorState(citationObjects, 'text', []);
      return bib;
    };

    this.getShortForm = function (citationID) {

      if (!_this.items[citationID]) {
        return null;
      }

      try {

        var citation_object = {
          "citationID": citationID,
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
          var foundCluster = void 0;
          if (cluster.length === 1) {
            foundCluster = cluster[0];
          } else {
            foundCluster = cluster.find(function (_cluster) {
              return _cluster[2] === citationID;
            });
          }
          return foundCluster[1];
        }
        return null;
      } catch (err) {
        console.log('Error making reference!', err);
        return "";
      }
    };

    this.addCitation = function (citation) {
      if (!_this.items[citation.id]) {
        _this.items[citation.id] = citation;
        _this.itemIDs.push(citation.id);
        _this.citeproc.updateItems(_this.itemIDs, true);
      }
    };

    this.getBibliography = function (itemIDs, strip) {
      if (!_this.citeproc) {
        return null;
      }
      if (itemIDs) {
        _this.citeproc.updateItems(itemIDs, true);
      }
      if (_this.citeproc.bibliography.tokens.length) {
        var bibRes = _this.citeproc.makeBibliography();
        if (bibRes && bibRes.length > 1) {
          var entries = bibRes[0].entry_ids.map(function (entry) {
            return entry[0];
          });
          var bibArray = bibRes[1];
          var extractRegex = /\s*\<div[^>]*\>(.*)\<\/div.*\>\s*/;
          var bib = bibArray.map(function (bibEntry, index) {
            if (bibEntry) {
              return { text: bibEntry, id: entries[index] };
              // return {text: striptags(bibEntry), id: entries[index]};
            }
            return null;
          });
          return bib;
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

      if (result && result.length >= 1 && result[1].length > 0) {
        return result[1][0];
      }
      return null;
    }
  }]);

  return CitationEngine;
}();

exports.default = CitationEngine;