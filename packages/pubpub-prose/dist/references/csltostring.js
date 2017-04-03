'use strict';

var _csldata = require('./csldata');

var _citeproc = require('./citeproc');

var CSLtoString = function CSLtoString(cslItem) {
  var style = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'acm';


  var sys = {
    retrieveItem: function retrieveItem(itemID) {
      return cslItem;
    },
    retrieveLocale: function retrieveLocale(locale) {
      return 'en';
    }
  };

  var citeproc = new _citeproc.CSL.Engine(undefined.sys, _csldata.styles[style]);

  citeproc.updateItems([cslItem.id], true);

  var query = {
    "include": [{
      "field": "id",
      "value": cslItem.id
    }]
  };
  var result = citeproc.makeBibliography(query);

  if (result && result.length >= 1 && result[1].length > 0) {
    return result[1][0];
  }
  return null;
};

exports.CSLtoString = CSLtoString;