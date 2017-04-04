import { locales, sampleData, styles } from './csldata';

import { CSL } from  './citeproc';
import parseBibTeX from './bibtextocsl';
import striptags from 'striptags';

class CitationEngine {

  constructor() {
    this.citeproc = null;
    this.items = {};
    this.itemIDs = [];

    this.style = 'acm';

    this.sys = {
      retrieveItem: (itemID) => {
        return this.items[itemID];
      },
      retrieveLocale: (locale) => {
        const result =  locales[locale];
        return result;

      },
    };

    this.setBibliography = this.setBibliography.bind(this);
    this.getShortForm = this.getShortForm.bind(this);
    this.getSingleBibliography = this.getSingleBibliography.bind(this);

  }

  setBibliography = (refItems) => {
    const citeproc = new CSL.Engine(this.sys, styles[this.style]);
    const itemIDs = refItems.map((item) => item.id);
    const items = {};
    for (const item of refItems) {
      items[item.id] = item;
    }
    this.items = items;
    this.itemIDs = itemIDs;
    citeproc.updateItems(itemIDs, true);
    this.citeproc = citeproc;
  }

  removeCitation = (citationID) => {
    this.items = this.items.filter((item) => (item.id !== citationID));
    this.itemIDs = this.itemIDs.filter((itemID) => (itemID !== citationID));
    citeproc.updateItems(itemIDs, true);
  }

  getAllReferences = () => {
    return this.items;
  }

  getShortForm = (citationID) => {

    console.log('Trying this', citationID);

    if (!this.items[citationID]) {
      return null;
    }

    try {

      var citation_object =
      {
          // items that are in a citation that we want to add. in this case,
          // there is only one citation object, and we know where it is in
          // advance.
          "citationItems": [
              {
                  "id": citationID
              }
          ],
          "properties": {
              "noteIndex": 0
          }

      }


      const citation = this.items[citationID];
      const cluster = this.citeproc.appendCitationCluster(citation_object, true);
      if (cluster && cluster.length > 0) {
        return cluster[0][1];
      }
      return null;

    } catch (err) {
      return null;
    }
  }

  addCitation = (citation) =>  {
    this.items[citation.id] = citation;
    this.itemIDs.push(citation.id);
    this.citeproc.updateItems(this.itemIDs, true);
  }

  getSingleBibliography(itemID) {
    if (!this.items[itemID]) {
      console.log('Could not find in dict');
      return null;
    }
    // console.log(this.citeproc);
    // this.citeproc.updateItems(this.itemIDs, true);
    const query = {
      "include" : [
         {
            "field" : "id",
            "value" : itemID
         }
      ]
   }
    const result = this.citeproc.makeBibliography(query);

    if (result && result.length >= 1 && result[1].length > 0) {
      return result[1][0];
    }
    return null;
  }

  getBibliography = (itemIDs, strip) => {
    if (!this.citeproc) {
      return null;
    }
    if (itemIDs) {
      this.citeproc.updateItems(itemIDs, true);
    }
    if (this.citeproc.bibliography.tokens.length) {
      const bibRes = this.citeproc.makeBibliography();
      if (bibRes && bibRes.length > 1) {
        const entries = bibRes[0].entry_ids.map((entry) => entry[0]);
        const bibArray = bibRes[1];
        const extractRegex = /\s*\<div[^>]*\>(.*)\<\/div.*\>\s*/;
        const bib = bibArray.map((bibEntry, index) => {
          if (bibEntry) {
            return {text: bibEntry, id: entries[index]};
            // return {text: striptags(bibEntry), id: entries[index]};
          }
          return null;
        });
        return bib;
      }
      return null;
    }
    return null;
  }

}


export default CitationEngine;
