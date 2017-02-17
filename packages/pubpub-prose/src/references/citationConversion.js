import parseBibTeX from './bibtextocsl';

const	generateBibTexString = (jsonInfo) => {
	const fields = ['title', 'author', 'journal', 'volume', 'number', 'pages', 'year'];
	const map = {
		'journal_title': 'journal',
		'author_instituion': 'institution',
	};
	const jsonKeys = Object.keys(jsonInfo);
	return `
		@article{bibgen,
			${jsonKeys.map(function(key) {
				if (jsonInfo[key]) {
					return `${key}={${jsonInfo[key]}}`;
				}
				return null;
			})
			.filter(value => (!!value))
			.join(',')}
		}
	`
};


const convertJSONtoCSL = (json) => {
  const bibTexString = generateBibTexString(json);
  const cslJSON = parseBibTeX(bibTexString);
  return cslJSON;
}



exports.convertJSONtoCSL = convertJSONtoCSL;
exports.generateBibTexString = generateBibTexString;
