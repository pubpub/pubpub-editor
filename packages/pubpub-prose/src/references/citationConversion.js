import parseBibTeX from './bibtextocsl';
import slugify from 'slugify';

const	generateBibTexString = (jsonInfo) => {
	const fields = ['title', 'author', 'journal', 'volume', 'number', 'pages', 'year'];
	const map = {
		'journal_title': 'journal',
		'author_instituion': 'institution',
	};
	if (jsonInfo['title'] === undefined) {
		jsonInfo['title'] = '';
	}
	if (jsonInfo['year'] === undefined) {
		jsonInfo['year'] = '';
	}

	const jsonKeys = Object.keys(jsonInfo);
	const id = slugify(jsonInfo['title'] + jsonInfo['year']);
	return `
		@article{${id},
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
