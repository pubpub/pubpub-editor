"use strict";

var varBibTeXSyntaxTokens = {
  "|": "{\\textbar}",
  "<": "{\\textless}",
  ">": "{\\textgreater}",
  "~": "{\\textasciitilde}",
  "^": "{\\textasciicircum}",
  "\\": "{\\textbackslash}",
  // See http://tex.stackexchange.com/questions/230750/open-brace-in-bibtex-fields/230754
  "{": "\\{\\vphantom{\\}}",
  "}": "\\vphantom{\\{}\\}"
};

/**
 * Object containing HTML strings for building JSON and BibTeX. Made to match citeproc, for compatability.
 *
 * @access private
 * @constant varHTMLDict
 * @default
 */
var varHTMLDict = {
  wr_start: '<div class="csl-bib-body">',
  wr_end: '</div>',
  en_start: '<div class="csl-entry">',
  en_end: '</div>',
  ul_start: '<ul style="list-style-type:none">',
  ul_end: '</ul>',
  li_start: '<li>',
  li_end: '</li>'
};

var fetchBibTeXType = function fetchBibTeXType(pubType) {

  switch (pubType) {
    case 'article':
    case 'article-journal':
    case 'article-magazine':
    case 'article-newspaper':
      return 'article';
      break;

    case 'book':
      return 'book';
      break;

    case 'chapter':
      return 'incollection';
      break;

    case 'manuscript':
      return 'unpublished';
      break;

    case 'paper-conference':
      return 'inproceedings';
      break;

    case 'patent':
      return 'patent';
      break;

    case 'report':
      return 'techreport';
      break;

    case 'thesis':
      return 'phdthesis';
      break;

    case 'graphic':
    case 'interview':
    case 'motion_picture':
    case 'personal_communication':
    case 'webpage':
      return 'misc';
      break;

    default:
      console.warn('CSL publication type not recognized: ' + pubType + '. Interpreting as "misc".');
      return 'misc';
      break;
  }
};

/**
 * BibTeX pub type to CSL pub type
 *
 * @access private
 * @method parseBibTeXType
 *
 * @param {String} pubType - BibTeX type
 *
 * @return {String} CSL type
 */
var parseBibTeXType = function parseBibTeXType(pubType) {
  switch (pubType) {

    case 'article':
      return 'article-journal';
      break;

    case 'book':
    case 'booklet':
    case 'manual':
    case 'misc':
    case 'proceedings':
      return 'book';
      break;

    case 'inbook':
    case 'incollection':
      return 'chapter';
      break;

    case 'conference':
    case 'inproceedings':
      return 'paper-conference';
      break;

    case 'online':
      return 'webpage';
      break;

    case 'patent':
      return 'patent';
      break;

    case 'phdthesis':
    case 'mastersthesis':
      return 'thesis';
      break;

    case 'techreport':
      return 'report';
      break;

    case 'unpublished':
      return 'manuscript';
      break;

    default:
      console.warn('BibTeX publication type not recognized: ' + pubType + '. Interpreting as "book".');
      return 'book';
      break;
  }
};

/**
 * Get a BibTeX label from CSL data
 *
 * @access private
 * @method getBibTeXLabel
 *
 * @param {CSL} src - Input CSL
 *
 * @return {String} The label
 */
var getBibTeXLabel = function getBibTeXLabel(src) {
  var res = '';

  if (src.hasOwnProperty('author') && Array.isArray(src.author) && src.author.length > 0) res += src.author[0].family || src.author[0].literal;

  if (src.hasOwnProperty('year')) res += src.year;else if (src.issued && src.issued[0] && src.issued[0]['date-parts']) res += src.issued[0]['date-parts'][0];

  if (src.hasOwnProperty('title')) res += src.title.replace(/^(the|a|an) /i, '').split(' ')[0];

  return res;
};

/**
 * Get BibTeX-JSON from CSL(-JSON)
 *
 * @access private
 * @method getBibTeXJSON
 *
 * @param {CSL} src - Input CSL
 *
 * @return {Object} Output BibTeX-JSON
 */
var getBibTeXJSON = function getBibTeXJSON(src) {
  var src = JSON.parse(JSON.stringify(src)),
      res = {},
      props = {};

  res.label = src.label || getBibTeXLabel(src);
  res.type = fetchBibTeXType(src.type);

  if (src.hasOwnProperty('author')) props.author = src.author.slice().map(getName).join(' and ');
  if (src.hasOwnProperty('event')) props.organization = src.event;
  if (src.hasOwnProperty('accessed')) props.note = '[Online; accesed ' + getDate(src.accessed) + ']';
  if (src.hasOwnProperty('DOI')) props.doi = src.DOI;
  if (src.hasOwnProperty('editor')) props.editor = src.editor.slice().map(getName).join(' and ');
  if (src.hasOwnProperty('ISBN')) props.isbn = src.ISBN;
  if (src.hasOwnProperty('ISSN')) props.issn = src.ISSN;
  if (src.hasOwnProperty('container-title')) props.journal = src['container-title'];
  if (src.hasOwnProperty('issue')) props.issue = src.issue.toString();
  if (src.hasOwnProperty('page')) props.pages = src.page.replace('-', '--');
  if (src.hasOwnProperty('publisher-place')) props.address = src['publisher-place'];
  if (src.hasOwnProperty('edition')) props.edition = src.edition.toString();
  if (src.hasOwnProperty('publisher')) props.publisher = src.publisher;
  if (src.hasOwnProperty('title')) props.title = src['title'];
  if (src.hasOwnProperty('url')) props.url = src.url;
  if (src.hasOwnProperty('volume')) props.volume = src.volume.toString();
  if (src.hasOwnProperty('issued') && Array.isArray(src.issued) && src.issued[0]['date-parts'].length === 3) props.year = src.issued[0]['date-parts'][0].toString();

  res.properties = props;

  return res;
};

/**
 * Get a BibTeX (HTML) string from CSL
 *
 * @access private
 * @method getBibTeX
 *
 * @param {CSL[]} src - Input CSL
 * @param {Boolean} html - Output as HTML string (instead of plain text)
 *
 * @return {String} BibTeX (HTML) string
 */
var getBibTeX = function getBibTeX(src, html) {
  var res = '',
      dict = varHTMLDict;

  if (html) res += dict.wr_start;

  for (var i = 0; i < src.length; i++) {
    var entry = src[i],
        bib = getBibTeXJSON(entry);

    if (html) res += dict.en_start;

    res += '@' + bib.type + '{' + bib.label + ',';

    if (html) res += dict.ul_start, res += dict.li_start;else res += '\n';

    var props = Object.keys(bib.properties);

    for (var propIndex = 0; propIndex < props.length; propIndex++) {
      var prop = props[propIndex],
          value = bib.properties[prop].replace(/[|<>~^\\{}]/g, function (match) {
        return varBibTeXSyntaxTokens[match];
      }),
          del_start =

      // Number
      value == parseInt(value).toString() ? '' :
      // Title or other capital-related fields
      prop === 'title' ? '{{' :
      // Default
      '{',
          del_end = del_start.replace(/{/g, '}').split('').reverse().join('');

      if (!html) res += '\t';

      res += prop + '=' + del_start + value + del_end + ',';

      if (propIndex + 1 < props.length) {

        if (html) res += dict.li_end, res += dict.li_start;
      }

      if (!html) res += '\n';
    }

    if (html) res += dict.li_end, res += dict.ul_end;

    res += '}';

    if (html) res += dict.en_end;
  }

  if (html) res += dict.wr_end;else res += '\n';

  return res;
};

exports.csltoBibtex = getBibTeX;