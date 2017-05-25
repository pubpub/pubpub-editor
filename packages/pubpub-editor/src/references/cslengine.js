import { locales, sampleData, styles } from './csldata';

import { CSL } from  './citeproc';

class CitationEngine {

  constructor() {
    this.citeproc = null;
    this.items = {};
    this.itemIDs = [];

    this.style = 'acm';

    this.sys = {
      retrieveItem: (itemID) => {
        if (this.items[itemID]) {
          return this.items[itemID];
        }
        return this.getEmptyRef(itemID);
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

  getEmptyRef(itemID) {
    return {
      id: itemID,
      title: `Reference ${itemID} not found.`,
    };
  }

  renderBibliography = (references, referenceOrder) => {

  }

  setBibliography = (refItems) => {
    const citeproc = new CSL.Engine(this.sys, styles[this.style]);
    let itemIDs = refItems.map((item) => item.id);
    itemIDs = [ ...new Set(itemIDs) ];
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

  buildFromArray = (citationsArray) => {
    this.setBibliography(citationsArray);
    const state =  this.buildState(this.itemIDs);
    const bib = this.getBibliography(this.itemIDs);
    return {state, bib};
  }

  buildState = (citations) => {
    const buildCitation = (citationID, index) => {
      return {
          "citationID": citationID,
          "citationItems": [
              {
                  "id": citationID
              }
          ],
          "properties": {
              "noteIndex": index,
          },
      };
    }
    const citationObjects = citations.map(buildCitation);
    const bib = this.citeproc.rebuildProcessorState(citationObjects, 'text', []);
    return bib;
  }

  getMissingCitations = (citationsList) => {
    const existingItems = Object.values(this.items);
    const notfoundIds = existingItems.filter((_existing) => {
      return !(citationsList.find((_citation) => {
        return (_existing.id === _citation.id);
      }));
    });
    return notfoundIds;
  }

  getShortForm = (citationID) => {

    /*
    if (!this.items[citationID]) {
      return "[N/A]";
    }
    */

    try {

      const citation_object =
      {
          "citationID": citationID,
          "citationItems": [
              {
                  "id": citationID
              }
          ],
          "properties": {
              "noteIndex": 0,
          },
      };


      const citation = this.items[citationID] || this.getEmptyRef(citationID);
      const cluster = this.citeproc.appendCitationCluster(citation_object, true);

      if (cluster && cluster.length > 0) {
        let foundCluster;
        if (cluster.length === 1) {
          foundCluster = cluster[0];
        } else {
          foundCluster = cluster.find((_cluster) => {
            return (_cluster[2] === citationID);
          });
        }
        return foundCluster[1];
      }
      return null;

    } catch (err) {
      console.log('Error making reference!', err);
      return "";
    }
  }

  addCitation = (citation) =>  {
    if (!this.items[citation.id]) {
      this.items[citation.id] = citation;
      this.itemIDs.push(citation.id);
      this.citeproc.updateItems(this.itemIDs, true);
    }
  }

  getSingleBibliography(itemID) {
    if (!this.items[itemID]) {
      return "Not Found";
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
