import { locales, sampleData, styles } from './csldata';

import { CSL } from  './citeproc';

const CSLtoString = (cslItem, style='acm') => {

  const sys = {
    retrieveItem: (itemID) => {
      return cslItem
    },
    retrieveLocale: (locale) => {
      return 'en';
    },
  };

  const citeproc = new CSL.Engine(this.sys, styles[style]);

  citeproc.updateItems([cslItem.id], true);

  const query = {
    "include" : [
       {
          "field" : "id",
          "value" : cslItem.id,
       }
    ]
 }
  const result = citeproc.makeBibliography(query);

  if (result && result.length >= 1 && result[1].length > 0) {
    return result[1][0];
  }
  return null;

}



exports.CSLtoString = CSLtoString;
