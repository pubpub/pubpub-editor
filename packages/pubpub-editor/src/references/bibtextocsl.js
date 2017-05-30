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
    let bibDB = parser.output;

    if (parser.errors.length) {
      console.log(parser.errors)
      return null;
    }
    const refKeys = [];

    for (const bibJSON of Object.values(bibDB)) {
      refKeys.push(bibJSON.entry_key);
    }

    let exporter = new CSLExporter(bibDB);
    const bibData = Object.values(exporter.output);
    for (const [index, bibEntry] of bibData.entries()) {
      bibEntry.id = refKeys[index];
    }
    return bibData;
}

export default parseBibTeX;
