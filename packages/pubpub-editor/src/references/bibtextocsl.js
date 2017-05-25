import { BibLatexParser, CSLExporter } from 'biblatex-csl-converter';

const parseBibTeX = function(bibString) {
    let parser = new BibLatexParser(
        bibString,
        {
            processUnexpected: true,
            processUnknown: {
                collaborator: 'l_name'
            }
        }
    )
    let bibDB = parser.output
    if (parser.errors.length) {
      console.log(parser.errors)
      return null;
    }
    let exporter = new CSLExporter(bibDB)
    return exporter.output;
}

export default parseBibTeX;
